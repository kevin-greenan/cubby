import { stat } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { exists, listFilesRecursive, readText, sha256, workspacePath, writeText } from "./fs-utils.js";
import type { ArtifactsOptions } from "./types.js";

const INDEXED_ROOTS = ["cubby/outputs", "cubby/exports"];
const INDEXED_EXTENSIONS = new Set([".csv", ".md", ".txt", ".yaml", ".yml"]);

interface ArtifactEntry {
  path: string;
  area: "output" | "export";
  format: string;
  bytes: number;
  modified_at: string;
  content_hash: string;
}

export async function runArtifacts(options: ArtifactsOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const artifacts: ArtifactEntry[] = [];

  for (const root of INDEXED_ROOTS) {
    const absoluteRoot = workspacePath(workspace, root);
    if (!(await exists(absoluteRoot))) {
      continue;
    }

    for (const file of await listFilesRecursive(absoluteRoot)) {
      const extension = path.extname(file).toLowerCase();
      if (!INDEXED_EXTENSIONS.has(extension)) {
        continue;
      }

      const content = await readText(file);
      if (content === undefined) {
        continue;
      }

      const fileStat = await stat(file);
      const relativePath = path.relative(workspace, file).split(path.sep).join("/");
      artifacts.push({
        path: relativePath,
        area: relativePath.startsWith("cubby/exports/") ? "export" : "output",
        format: extension.slice(1),
        bytes: fileStat.size,
        modified_at: fileStat.mtime.toISOString(),
        content_hash: sha256(content)
      });
    }
  }

  const indexPath = "cubby/logs/artifacts/index.yaml";
  await writeText(
    workspacePath(workspace, indexPath),
    YAML.stringify({
      created_at: new Date().toISOString(),
      artifact_count: artifacts.length,
      artifacts
    })
  );

  console.log("Cubby artifact index written.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Path: ${indexPath}`);
  console.log(`Artifacts: ${artifacts.length}`);
  return 0;
}
