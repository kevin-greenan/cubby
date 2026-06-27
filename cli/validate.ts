import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";
import { USER_OWNED_DIRS } from "./constants.js";
import { exists, listFilesRecursive, readText, sha256, workspacePath, writeText } from "./fs-utils.js";
import type { Manifest, ValidateOptions } from "./types.js";

interface ValidationMessage {
  status: "pass" | "warn" | "fail";
  path: string;
  message: string;
}

const REQUIRED_PATHS = [
  "AGENTS.md",
  ".cubby-version",
  "cubby/config.yaml",
  "cubby/manifest.yaml",
  "cubby/state/current-task.yaml",
  "cubby/framework/commands/lesson-plan.md",
  "cubby/framework/workflows/lesson-plan.yaml",
  "cubby/framework/rules/core/human-review.md",
  "cubby/framework/subagents/README.md",
  "cubby/framework/validators/privacy-check.yaml",
  "cubby/framework/hooks/validate.yaml",
  "cubby/framework/skills/README.md",
  "cubby/framework/tools/README.md",
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

  const currentTask = await parseYaml<unknown>(workspace, "cubby/state/current-task.yaml", messages);
  if (currentTask) {
    await validateWithSchema(currentTask, "src/schemas/state.schema.json", "cubby/state/current-task.yaml", messages);
  }

  await validateFrameworkDefinitions(workspace, messages);
  await writeValidationLog(workspace, messages);

  printMessages(workspace, messages);
  return messages.some((message) => message.status === "fail") ? 1 : 0;
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
