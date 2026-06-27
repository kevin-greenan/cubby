import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export function workspacePath(workspace: string, relativePath = ""): string {
  return path.resolve(workspace, relativePath);
}

export async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function readText(filePath: string): Promise<string | undefined> {
  if (!(await exists(filePath))) {
    return undefined;
  }
  return readFile(filePath, "utf8");
}

export async function writeText(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, content, "utf8");
}

export function sha256(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export function markdownHeader(): string {
  return [
    "<!--",
    "managed-by: cubby",
    "managed-version: 0.1.0",
    "local-edits: discouraged",
    "safe-customization: use cubby/local/ or cubby/templates/custom/",
    "-->",
    ""
  ].join("\n");
}

export function yamlHeader(): string {
  return [
    "# managed-by: cubby",
    "# managed-version: 0.1.0",
    "# local-edits: discouraged",
    "# safe-customization: use cubby/local/ or cubby/templates/custom/",
    ""
  ].join("\n");
}
