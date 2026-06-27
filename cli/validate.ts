import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";
import { USER_OWNED_DIRS } from "./constants.js";
import { exists, listFilesRecursive, readText, sha256, workspacePath, writeText } from "./fs-utils.js";
import { findSensitivePatterns } from "./sensitive.js";
import type { Manifest, ValidateOptions } from "./types.js";
import type { CurrentTask } from "./workspace.js";
import { plannedOutputPaths, readWorkflow, taskSlugFromId } from "./workflows.js";

interface ValidationMessage {
  status: "pass" | "warn" | "fail";
  path: string;
  message: string;
}

interface PackDefinition {
  id?: string;
  name?: string;
  description?: string;
  unmet_use_case?: string;
  status?: "draft" | "active" | "deprecated";
  scope?: {
    include?: string[];
    exclude?: string[];
  };
  workflows?: string[];
  commands?: string[];
  agents?: string[];
  templates?: string[];
  validators?: string[];
  hooks?: string[];
  tools?: string[];
  quality_checks?: string[];
  review_gates?: {
    human_review_required_for_sensitive_outputs?: boolean;
    notes?: string;
  };
}

const PLACEHOLDER_PATTERN = /\b(tbd|todo|placeholder|lorem|describe|add pack-specific|add one to three|ai slop)\b/i;
const ARTIFACT_PLACEHOLDER_PATTERN = /\b(tbd|todo|placeholder|lorem|insert|replace me)\b|{{|}}|\[[^\]]*(insert|todo|tbd)[^\]]*\]/i;

const REQUIRED_PATHS = [
  "AGENTS.md",
  ".cubby-version",
  "cubby/config.yaml",
  "cubby/manifest.yaml",
  "cubby/state/current-task.yaml",
  "cubby/framework/commands/start.md",
  "cubby/framework/commands/advance.md",
  "cubby/framework/commands/lesson-plan.md",
  "cubby/framework/workflows/lesson-plan.yaml",
  "cubby/framework/rules/core/human-review.md",
  "cubby/framework/subagents/README.md",
  "cubby/framework/validators/privacy-check.yaml",
  "cubby/framework/hooks/validate.yaml",
  "cubby/framework/skills/README.md",
  "cubby/framework/tools/README.md",
  "cubby/framework/tools/pack-design.md",
  "cubby/framework/extensions/README.md"
];

export async function runValidate(options: ValidateOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const messages: ValidationMessage[] = [];

  for (const requiredPath of REQUIRED_PATHS) {
    messages.push({
      status: (await exists(workspacePath(workspace, requiredPath))) ? "pass" : "fail",
      path: requiredPath,
      message: "required path"
    });
  }

  for (const dir of USER_OWNED_DIRS) {
    messages.push({
      status: (await exists(workspacePath(workspace, dir))) ? "pass" : "fail",
      path: dir,
      message: "user-owned directory"
    });
  }

  const manifest = await parseYaml<Manifest>(workspace, "cubby/manifest.yaml", messages);
  if (manifest) {
    await validateWithSchema(manifest, "src/schemas/manifest.schema.json", "cubby/manifest.yaml", messages);
    for (const entry of manifest.managed_files ?? []) {
      const content = await readText(workspacePath(workspace, entry.path));
      if (content === undefined) {
        messages.push({ status: "fail", path: entry.path, message: "managed file missing" });
        continue;
      }
      const actualHash = sha256(content);
      if (entry.path === "cubby/state/current-task.yaml" && actualHash !== entry.content_hash) {
        messages.push({
          status: "pass",
          path: entry.path,
          message: "task state changed from initial scaffold"
        });
        continue;
      }
      messages.push({
        status: actualHash === entry.content_hash ? "pass" : "warn",
        path: entry.path,
        message: actualHash === entry.content_hash ? "managed file hash matches" : "managed file has local edits"
      });
    }
  }

  const currentTask = await parseYaml<CurrentTask>(workspace, "cubby/state/current-task.yaml", messages);
  if (currentTask) {
    await validateWithSchema(currentTask, "src/schemas/state.schema.json", "cubby/state/current-task.yaml", messages);
    await validateActiveWorkflowState(workspace, currentTask, messages);
    await validateOutputRecords(workspace, currentTask, messages);
  }

  await validateFrameworkDefinitions(workspace, messages);
  await validatePackReferences(workspace, messages);
  await runArtifactValidation(workspace, messages);
  await writeValidationLog(workspace, messages);

  printMessages(workspace, messages);
  return messages.some((message) => message.status === "fail") ? 1 : 0;
}

async function validateActiveWorkflowState(workspace: string, currentTask: CurrentTask, messages: ValidationMessage[]): Promise<void> {
  const workflowId = currentTask.task?.workflow;
  if (!workflowId) {
    messages.push({ status: "pass", path: "cubby/state/current-task.yaml", message: "no active workflow selected" });
    return;
  }

  const workflowPath = `cubby/framework/workflows/${workflowId}.yaml`;
  const workflow = await readWorkflow(workspace, workflowId);
  if (!workflow) {
    messages.push({ status: "fail", path: "cubby/state/current-task.yaml", message: `active workflow missing: ${workflowId}` });
    return;
  }
  messages.push({ status: "pass", path: workflowPath, message: "active workflow resolved" });

  const phase = currentTask.task?.phase ?? "";
  if ((workflow.phases ?? []).includes(phase)) {
    messages.push({ status: "pass", path: "cubby/state/current-task.yaml", message: `active workflow phase valid: ${phase}` });
  } else {
    messages.push({ status: "fail", path: "cubby/state/current-task.yaml", message: `active workflow phase invalid: ${phase}` });
  }

  const taskSlug = taskSlugFromId(workflowId, currentTask.task?.id);
  const expectedOutputs = plannedOutputPaths(workflow, taskSlug);
  const draftPaths = (currentTask.outputs?.drafts ?? [])
    .map((draft) => (isRecord(draft) && typeof draft.path === "string" ? draft.path : undefined))
    .filter((value): value is string => Boolean(value));
  for (const expectedOutput of expectedOutputs) {
    messages.push({
      status: draftPaths.includes(expectedOutput) ? "pass" : "warn",
      path: "cubby/state/current-task.yaml",
      message: draftPaths.includes(expectedOutput) ? `planned workflow output present: ${expectedOutput}` : `planned workflow output missing: ${expectedOutput}`
    });
  }

  for (const agent of currentTask.subagents?.fanout?.requested ?? []) {
    if (typeof agent !== "string") {
      continue;
    }
    const found = await exists(workspacePath(workspace, `cubby/framework/agents/${agent}.md`));
    messages.push({
      status: found ? "pass" : "fail",
      path: "cubby/state/current-task.yaml",
      message: found ? `requested subagent resolved: ${agent}` : `requested subagent missing: ${agent}`
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parseYaml<T>(workspace: string, relativePath: string, messages: ValidationMessage[]): Promise<T | undefined> {
  const text = await readText(workspacePath(workspace, relativePath));
  if (text === undefined) {
    return undefined;
  }
  try {
    const parsed = YAML.parse(text) as T;
    messages.push({ status: "pass", path: relativePath, message: "YAML parsed" });
    return parsed;
  } catch (error) {
    messages.push({ status: "fail", path: relativePath, message: `YAML parse failed: ${(error as Error).message}` });
    return undefined;
  }
}

async function validateWithSchema(data: unknown, schemaRelativePath: string, targetPath: string, messages: ValidationMessage[]): Promise<void> {
  const schemaPath = path.resolve(process.cwd(), schemaRelativePath);
  const schema = JSON.parse(await readFile(schemaPath, "utf8")) as object;
  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(data);
  if (valid) {
    messages.push({ status: "pass", path: targetPath, message: `${path.basename(schemaRelativePath)} valid` });
    return;
  }

  const details = validate.errors?.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
  messages.push({ status: "fail", path: targetPath, message: `${path.basename(schemaRelativePath)} invalid: ${details}` });
}

async function validateFrameworkDefinitions(workspace: string, messages: ValidationMessage[]): Promise<void> {
  await validateYamlFiles(workspace, "cubby/framework/workflows", "src/schemas/workflow.schema.json", messages);
  await validateYamlFiles(workspace, "cubby/framework/packs", "src/schemas/pack.schema.json", messages);
  await validateYamlFiles(workspace, "cubby/framework/profiles", "src/schemas/profile.schema.json", messages);
  await validateYamlFiles(workspace, "cubby/framework/validators", "src/schemas/validation-result.schema.json", messages);
}

async function validateYamlFiles(workspace: string, relativeDir: string, schemaPath: string, messages: ValidationMessage[]): Promise<void> {
  const absoluteDir = workspacePath(workspace, relativeDir);
  if (!(await exists(absoluteDir))) {
    return;
  }
  const files = (await listFilesRecursive(absoluteDir)).filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));
  for (const file of files) {
    const relativePath = path.relative(workspace, file).split(path.sep).join("/");
    const parsed = await parseYaml<unknown>(workspace, relativePath, messages);
    if (parsed) {
      await validateWithSchema(parsed, schemaPath, relativePath, messages);
    }
  }
}

async function validatePackReferences(workspace: string, messages: ValidationMessage[]): Promise<void> {
  const packDir = workspacePath(workspace, "cubby/framework/packs");
  if (!(await exists(packDir))) {
    return;
  }

  const files = (await listFilesRecursive(packDir)).filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));
  for (const file of files) {
    const relativePath = path.relative(workspace, file).split(path.sep).join("/");
    const parsed = await parseYaml<PackDefinition>(workspace, relativePath, messages);
    if (!parsed) {
      continue;
    }
    validatePackQuality(relativePath, parsed, messages);
    await validatePackReferenceList(workspace, relativePath, "workflow", parsed.workflows, (id) => [`cubby/framework/workflows/${id}.yaml`], messages);
    await validatePackReferenceList(workspace, relativePath, "command", parsed.commands, (id) => [`cubby/framework/commands/${id}.md`], messages);
    await validatePackReferenceList(workspace, relativePath, "agent", parsed.agents, (id) => [`cubby/framework/agents/${id}.md`], messages);
    await validatePackReferenceList(workspace, relativePath, "template", parsed.templates, (id) => [`cubby/framework/templates/${id}.md`, `cubby/framework/templates/${id}.csv`], messages);
    await validatePackReferenceList(workspace, relativePath, "validator", parsed.validators, (id) => [`cubby/framework/validators/${id}.yaml`], messages);
    await validatePackReferenceList(workspace, relativePath, "hook", parsed.hooks, (id) => [`cubby/framework/hooks/${id}.yaml`], messages);
    await validatePackReferenceList(workspace, relativePath, "tool", parsed.tools, (id) => [`cubby/framework/tools/${id}.md`, `cubby/framework/commands/${id}.md`], messages);
  }
}

function validatePackQuality(packPath: string, pack: PackDefinition, messages: ValidationMessage[]): void {
  const isActive = pack.status === "active";
  const failOrWarn: "fail" | "warn" = isActive ? "fail" : "warn";
  const issues: string[] = [];
  const textFields = [
    pack.id,
    pack.name,
    pack.description,
    pack.unmet_use_case,
    ...(pack.scope?.include ?? []),
    ...(pack.scope?.exclude ?? []),
    ...(pack.quality_checks ?? []),
    pack.review_gates?.notes
  ].filter((value): value is string => typeof value === "string");

  if (!pack.description || pack.description.trim().length < 40) {
    issues.push("description must be specific");
  }
  if (!pack.unmet_use_case || pack.unmet_use_case.trim().length < 40) {
    issues.push("unmet use case must be explicit");
  }
  if ((pack.scope?.include ?? []).length === 0 || (pack.scope?.exclude ?? []).length === 0) {
    issues.push("scope must include include and exclude boundaries");
  }
  if ((pack.quality_checks ?? []).length < 2) {
    issues.push("quality checks must include at least two concrete checks");
  }
  if ((pack.workflows ?? []).length === 0 && (pack.commands ?? []).length === 0) {
    issues.push("pack must reference at least one workflow or command");
  }
  if ((pack.validators ?? []).length === 0) {
    issues.push("pack must reference at least one validator");
  }
  if (!pack.review_gates?.notes || pack.review_gates.notes.trim().length < 20) {
    issues.push("review gate notes must be specific");
  }
  if (pack.review_gates?.human_review_required_for_sensitive_outputs !== true) {
    issues.push("sensitive outputs must require human review");
  }
  if (textFields.some((value) => PLACEHOLDER_PATTERN.test(value))) {
    issues.push("placeholder language must be removed");
  }

  if (issues.length === 0) {
    messages.push({ status: "pass", path: packPath, message: "pack quality gates passed" });
    return;
  }

  messages.push({
    status: failOrWarn,
    path: packPath,
    message: `pack quality gates need attention: ${issues.join("; ")}`
  });
}

async function validatePackReferenceList(
  workspace: string,
  packPath: string,
  kind: string,
  ids: string[] | undefined,
  candidatesFor: (id: string) => string[],
  messages: ValidationMessage[]
): Promise<void> {
  for (const id of ids ?? []) {
    const candidates = candidatesFor(id);
    const found = await pathExistsAny(workspace, candidates);
    messages.push({
      status: found ? "pass" : "fail",
      path: packPath,
      message: found ? `pack ${kind} reference resolved: ${id}` : `pack ${kind} reference missing: ${id}`
    });
  }
}

async function pathExistsAny(workspace: string, candidates: string[]): Promise<boolean> {
  for (const candidate of candidates) {
    if (await exists(workspacePath(workspace, candidate))) {
      return true;
    }
  }
  return false;
}

async function runArtifactValidation(workspace: string, messages: ValidationMessage[]): Promise<void> {
  await scanArtifactDir(workspace, "cubby/outputs", messages);
  await scanArtifactDir(workspace, "cubby/exports", messages);
}

async function validateOutputRecords(workspace: string, currentTask: CurrentTask, messages: ValidationMessage[]): Promise<void> {
  for (const draft of currentTask.outputs?.drafts ?? []) {
    if (!isRecord(draft) || typeof draft.path !== "string") {
      messages.push({ status: "warn", path: "cubby/state/current-task.yaml", message: "draft output record missing path" });
      continue;
    }
    const draftPath = draft.path;
    if (!draftPath.startsWith("cubby/outputs/")) {
      messages.push({ status: "fail", path: "cubby/state/current-task.yaml", message: `draft output path outside cubby/outputs: ${draftPath}` });
      continue;
    }
    if (await exists(workspacePath(workspace, draftPath))) {
      messages.push({ status: "pass", path: draftPath, message: "draft output file exists" });
    } else if (draft.status !== "planned") {
      messages.push({ status: "warn", path: draftPath, message: "draft output record points to a missing file" });
    }
  }

  for (const exportRecord of currentTask.outputs?.exports ?? []) {
    if (!isRecord(exportRecord) || typeof exportRecord.path !== "string" || typeof exportRecord.source !== "string") {
      messages.push({ status: "warn", path: "cubby/state/current-task.yaml", message: "export record missing path or source" });
      continue;
    }
    const exportPath = exportRecord.path;
    const sourcePath = exportRecord.source;
    if (!exportPath.startsWith("cubby/exports/")) {
      messages.push({ status: "fail", path: "cubby/state/current-task.yaml", message: `export path outside cubby/exports: ${exportPath}` });
    }
    if (!sourcePath.startsWith("cubby/outputs/")) {
      messages.push({ status: "fail", path: "cubby/state/current-task.yaml", message: `export source outside cubby/outputs: ${sourcePath}` });
    }
    const exportExists = await exists(workspacePath(workspace, exportPath));
    const sourceExists = await exists(workspacePath(workspace, sourcePath));
    messages.push({
      status: exportExists ? "pass" : "warn",
      path: exportPath,
      message: exportExists ? "export file exists" : "export record points to a missing file"
    });
    messages.push({
      status: sourceExists ? "pass" : "warn",
      path: sourcePath,
      message: sourceExists ? "export source file exists" : "export source file is missing"
    });
  }
}

async function scanArtifactDir(workspace: string, relativeDir: string, messages: ValidationMessage[]): Promise<void> {
  const absoluteDir = workspacePath(workspace, relativeDir);
  if (!(await exists(absoluteDir))) {
    return;
  }
  const files = (await listFilesRecursive(absoluteDir)).filter((file) => [".md", ".txt", ".yaml", ".yml", ".csv"].includes(path.extname(file).toLowerCase()));
  if (files.length === 0) {
    messages.push({ status: "pass", path: relativeDir, message: "artifact validation found no files" });
    return;
  }

  for (const file of files) {
    const relativePath = path.relative(workspace, file).split(path.sep).join("/");
    const content = await readText(file);
    if (content === undefined) {
      continue;
    }
    const findings = findSensitivePatterns(content);
    messages.push({
      status: findings.length > 0 ? "warn" : "pass",
      path: relativePath,
      message: findings.length > 0 ? `sensitive-pattern scan found ${findings.length} finding(s)` : "sensitive-pattern scan passed"
    });
    validateArtifactContent(relativePath, content, messages);
  }
}

function validateArtifactContent(relativePath: string, content: string, messages: ValidationMessage[]): void {
  const extension = path.extname(relativePath).toLowerCase();
  if (extension === ".md") {
    validateMarkdownArtifact(relativePath, content, messages);
    return;
  }
  if (extension === ".csv") {
    validateCsvArtifact(relativePath, content, messages);
    return;
  }
  if (extension === ".yaml" || extension === ".yml") {
    validateYamlArtifact(relativePath, content, messages);
  }
}

function validateMarkdownArtifact(relativePath: string, content: string, messages: ValidationMessage[]): void {
  const trimmed = content.trim();
  if (!trimmed) {
    messages.push({ status: "warn", path: relativePath, message: "markdown artifact is empty" });
    return;
  }
  messages.push({
    status: /^#\s+\S/m.test(content) ? "pass" : "warn",
    path: relativePath,
    message: /^#\s+\S/m.test(content) ? "markdown artifact has a top-level heading" : "markdown artifact missing a top-level heading"
  });
  messages.push({
    status: ARTIFACT_PLACEHOLDER_PATTERN.test(content) ? "warn" : "pass",
    path: relativePath,
    message: ARTIFACT_PLACEHOLDER_PATTERN.test(content) ? "markdown artifact contains placeholder text" : "markdown artifact has no obvious placeholders"
  });
}

function validateCsvArtifact(relativePath: string, content: string, messages: ValidationMessage[]): void {
  const rows = content.trim().split(/\r?\n/).filter(Boolean);
  if (rows.length === 0) {
    messages.push({ status: "warn", path: relativePath, message: "CSV artifact is empty" });
    return;
  }
  const headerColumns = rows[0].split(",");
  messages.push({
    status: headerColumns.length > 1 ? "pass" : "warn",
    path: relativePath,
    message: headerColumns.length > 1 ? "CSV artifact has a multi-column header" : "CSV artifact header has fewer than two columns"
  });
}

function validateYamlArtifact(relativePath: string, content: string, messages: ValidationMessage[]): void {
  try {
    YAML.parse(content);
    messages.push({ status: "pass", path: relativePath, message: "YAML artifact parsed" });
  } catch (error) {
    messages.push({ status: "warn", path: relativePath, message: `YAML artifact parse failed: ${(error as Error).message}` });
  }
}

async function writeValidationLog(workspace: string, messages: ValidationMessage[]): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const logPath = `cubby/logs/validations/validation-${timestamp}.yaml`;
  await writeText(
    workspacePath(workspace, logPath),
    YAML.stringify({
      created_at: new Date().toISOString(),
      status: messages.some((message) => message.status === "fail") ? "fail" : messages.some((message) => message.status === "warn") ? "warn" : "pass",
      messages
    })
  );
  messages.push({ status: "pass", path: logPath, message: "validation log written" });
}

function printMessages(workspace: string, messages: ValidationMessage[]): void {
  const failed = messages.filter((message) => message.status === "fail").length;
  const warned = messages.filter((message) => message.status === "warn").length;
  console.log(failed > 0 ? "Cubby validation failed." : warned > 0 ? "Cubby validation passed with warnings." : "Cubby validation passed.");
  console.log(`Workspace: ${workspace}`);
  for (const message of messages) {
    console.log(`${message.status}\t${message.path}\t${message.message}`);
  }
}
