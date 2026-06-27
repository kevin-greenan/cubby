import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import YAML from "yaml";
import { USER_OWNED_DIRS } from "./constants.js";
import { exists, readText, sha256, workspacePath } from "./fs-utils.js";
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
  "cubby/state/current-task.yaml"
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
    for (const entry of manifest.managed_files ?? []) {
      const content = await readText(workspacePath(workspace, entry.path));
      if (content === undefined) {
        messages.push({ status: "fail", path: entry.path, message: "managed file missing" });
        continue;
      }
      const actualHash = sha256(content);
      messages.push({
        status: actualHash === entry.content_hash ? "pass" : "warn",
        path: entry.path,
        message: actualHash === entry.content_hash ? "managed file hash matches" : "managed file has local edits"
      });
    }
  }

  const currentTask = await parseYaml<unknown>(workspace, "cubby/state/current-task.yaml", messages);
  if (currentTask) {
    await validateCurrentTask(currentTask, messages);
  }

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

async function validateCurrentTask(currentTask: unknown, messages: ValidationMessage[]): Promise<void> {
  const schemaPath = path.resolve(process.cwd(), "src/schemas/state.schema.json");
  const schema = JSON.parse(await readFile(schemaPath, "utf8")) as object;
  const ajv = new Ajv2020({ allErrors: true });
  const validate = ajv.compile(schema);
  const valid = validate(currentTask);
  if (valid) {
    messages.push({ status: "pass", path: "cubby/state/current-task.yaml", message: "state schema valid" });
    return;
  }

  const details = validate.errors?.map((error) => `${error.instancePath || "/"} ${error.message}`).join("; ");
  messages.push({ status: "fail", path: "cubby/state/current-task.yaml", message: `state schema invalid: ${details}` });
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
