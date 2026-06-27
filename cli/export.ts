import path from "node:path";
import { exists, readText, workspacePath, writeText } from "./fs-utils.js";
import type { ExportOptions } from "./types.js";
import { readCurrentTask, writeCurrentTask } from "./workspace.js";

interface ExportRecord {
  path: string;
  source: string;
  format: "markdown";
  created_at: string;
  review_override: boolean;
}

export async function runExport(options: ExportOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  if (!options.source) {
    console.error("failed\t--source is required");
    return 1;
  }

  const sourcePath = normalizeWorkspacePath(workspace, options.source);
  if (!sourcePath) {
    console.error("failed\t--source must resolve inside the workspace");
    return 1;
  }
  if (!sourcePath.startsWith("cubby/outputs/")) {
    console.error("failed\t--source must be under cubby/outputs/");
    return 1;
  }
  if (path.extname(sourcePath).toLowerCase() !== ".md") {
    console.error("failed\tonly Markdown exports are supported in v1 local export");
    return 1;
  }

  const currentTask = await readCurrentTask(workspace);
  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }

  const reviewRequired = currentTask.validation?.human_review_required?.required === true;
  if (reviewRequired && !options.force) {
    console.error("failed\thuman review is required before export; rerun with --force only after review");
    return 1;
  }

  const sourceContent = await readText(workspacePath(workspace, sourcePath));
  if (sourceContent === undefined) {
    console.error(`failed\t${sourcePath}\tsource file missing`);
    return 1;
  }

  const exportPath = `cubby/exports/markdown/${sourcePath.replace(/^cubby\/outputs\//, "")}`;
  if ((await exists(workspacePath(workspace, exportPath))) && !options.overwrite) {
    console.error(`failed\t${exportPath}\texport already exists; rerun with --overwrite`);
    return 1;
  }

  await writeText(workspacePath(workspace, exportPath), sourceContent);

  const record: ExportRecord = {
    path: exportPath,
    source: sourcePath,
    format: "markdown",
    created_at: new Date().toISOString(),
    review_override: reviewRequired && options.force
  };

  const outputs = currentTask.outputs ?? { drafts: [], exports: [] };
  outputs.exports = [...(outputs.exports ?? []), record];
  currentTask.outputs = outputs;
  await writeCurrentTask(workspace, currentTask);

  console.log("Cubby export written.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Source: ${sourcePath}`);
  console.log(`Export: ${exportPath}`);
  console.log(`Review override: ${record.review_override}`);
  return 0;
}

function normalizeWorkspacePath(workspace: string, candidate: string): string | undefined {
  const absolute = path.isAbsolute(candidate) ? path.resolve(candidate) : workspacePath(workspace, candidate);
  const relative = path.relative(workspace, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return undefined;
  }
  return relative.split(path.sep).join("/");
}
