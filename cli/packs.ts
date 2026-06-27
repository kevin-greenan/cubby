import path from "node:path";
import YAML from "yaml";
import { exists, listFilesRecursive, readText, workspacePath } from "./fs-utils.js";
import type { PacksOptions } from "./types.js";

interface Pack {
  id?: string;
  name?: string;
  description?: string;
  unmet_use_case?: string;
  status?: string;
  scope?: {
    include?: string[];
    exclude?: string[];
  };
  workflows?: string[];
  commands?: string[];
  quality_checks?: string[];
  review_gates?: {
    notes?: string;
  };
}

export async function runPacks(options: PacksOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const packDir = workspacePath(workspace, "cubby/framework/packs");
  if (!(await exists(packDir))) {
    console.error("failed\tcubby/framework/packs\tmissing pack directory");
    return 1;
  }

  const files = (await listFilesRecursive(packDir)).filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"));
  const packs: Pack[] = [];
  for (const file of files) {
    const text = await readText(file);
    if (!text) {
      continue;
    }
    packs.push(YAML.parse(text) as Pack);
  }

  console.log("Cubby packs");
  console.log(`Workspace: ${workspace}`);
  console.log(`Packs: ${packs.length}`);
  for (const pack of packs.sort((left, right) => String(left.id).localeCompare(String(right.id)))) {
    console.log(`${pack.status ?? "unknown"}\t${pack.id ?? ""}\t${pack.name ?? ""}`);
    if (pack.description) {
      console.log(`  ${pack.description}`);
    }
    if (pack.unmet_use_case) {
      console.log(`  need: ${pack.unmet_use_case}`);
    }
    console.log(`  include: ${formatList(pack.scope?.include)}`);
    console.log(`  exclude: ${formatList(pack.scope?.exclude)}`);
    console.log(`  workflows: ${(pack.workflows ?? []).join(", ") || "none"}`);
    console.log(`  commands: ${(pack.commands ?? []).join(", ") || "none"}`);
    console.log(`  quality: ${formatList(pack.quality_checks)}`);
    if (pack.review_gates?.notes) {
      console.log(`  review: ${pack.review_gates.notes}`);
    }
  }
  return 0;
}

function formatList(items: string[] | undefined): string {
  return items && items.length > 0 ? items.join("; ") : "none";
}
