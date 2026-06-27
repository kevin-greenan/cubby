import path from "node:path";
import YAML from "yaml";
import { readText, sha256, workspacePath } from "./fs-utils.js";
import { buildManagedSpecs } from "./init.js";
import type { Manifest, OperationResult, UpgradeOptions } from "./types.js";

export async function runUpgrade(options: UpgradeOptions): Promise<number> {
  if (!options.dryRun) {
    console.error("failed\tupgrade currently supports --dry-run only");
    return 1;
  }

  const workspace = path.resolve(options.workspace);
  const manifestText = await readText(workspacePath(workspace, "cubby/manifest.yaml"));
  if (!manifestText) {
    console.error("failed\tcubby/manifest.yaml\tmissing manifest");
    return 1;
  }

  const manifest = YAML.parse(manifestText) as Manifest;
  const specs = await buildManagedSpecs({
    profile: manifest.profile,
    adapter: manifest.adapter.name,
    workspace
  });
  const specByPath = new Map(specs.map((spec) => [spec.path, spec]));
  const results: OperationResult[] = [];

  for (const entry of manifest.managed_files) {
    const existing = await readText(workspacePath(workspace, entry.path));
    const spec = specByPath.get(entry.path);
    if (existing === undefined) {
      results.push({ status: "created", path: entry.path, message: "would recreate missing managed file" });
      continue;
    }

    const existingHash = sha256(existing);
    if (existingHash !== entry.content_hash) {
      results.push({ status: "preserved-local-edit", path: entry.path, message: "would preserve local edit" });
      continue;
    }

    if (spec && sha256(spec.content) !== existingHash) {
      results.push({ status: "updated", path: entry.path, message: "would update managed file" });
      continue;
    }

    results.push({ status: "skipped", path: entry.path, message: "no change" });
  }

  for (const spec of specs) {
    if (!manifest.managed_files.some((entry) => entry.path === spec.path)) {
      results.push({ status: "created", path: spec.path, message: "would add new managed file" });
    }
  }

  console.log("Cubby upgrade dry run.");
  console.log(`Workspace: ${workspace}`);
  for (const result of results) {
    console.log(`${result.status}\t${result.path}\t${result.message}`);
  }
  console.log(
    `Summary: created=${count(results, "created")} updated=${count(results, "updated")} skipped=${count(results, "skipped")} preserved-local-edit=${count(results, "preserved-local-edit")} failed=${count(results, "failed")}`
  );
  return results.some((result) => result.status === "failed") ? 1 : 0;
}

function count(results: OperationResult[], status: OperationResult["status"]): number {
  return results.filter((result) => result.status === status).length;
}
