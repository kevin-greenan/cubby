import path from "node:path";
import { readText, sha256, workspacePath } from "./fs-utils.js";
import { readManifest } from "./workspace.js";
import type { ManifestOptions, OperationResult } from "./types.js";

export async function runManifest(options: ManifestOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const manifest = await readManifest(workspace);
  if (!manifest) {
    console.error("failed\tcubby/manifest.yaml\tmissing manifest");
    return 1;
  }

  const results: OperationResult[] = [];
  for (const entry of manifest.managed_files) {
    const content = await readText(workspacePath(workspace, entry.path));
    if (content === undefined) {
      results.push({ status: "failed", path: entry.path, message: "missing managed file" });
      continue;
    }
    const actualHash = sha256(content);
    results.push({
      status: actualHash === entry.content_hash ? "skipped" : "preserved-local-edit",
      path: entry.path,
      message: actualHash === entry.content_hash ? "hash matches" : "local edit detected"
    });
  }

  console.log("Cubby manifest");
  console.log(`Workspace: ${workspace}`);
  console.log(`Version: ${manifest.cubby_version}`);
  console.log(`Profile: ${manifest.profile}`);
  console.log(`Adapter: ${manifest.adapter.name}`);
  console.log(`Managed files: ${manifest.managed_files.length}`);
  console.log(`Local preserved paths: ${manifest.local_preserved_paths.length}`);
  console.log(`Local edits: ${results.filter((result) => result.status === "preserved-local-edit").length}`);
  console.log(`Missing files: ${results.filter((result) => result.status === "failed").length}`);
  return results.some((result) => result.status === "failed") ? 1 : 0;
}
