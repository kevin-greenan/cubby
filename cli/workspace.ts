import YAML from "yaml";
import { readText, workspacePath, writeText } from "./fs-utils.js";
import type { Manifest } from "./types.js";

export interface CurrentTask {
  task?: {
    id?: string;
    title?: string;
    workflow?: string;
    status?: string;
    phase?: string;
    risk_level?: string;
  };
  subagents?: {
    strategy?: string;
    fanout?: {
      status?: string;
      requested?: unknown[];
      completed?: unknown[];
    };
    calls?: unknown[];
  };
  decisions?: unknown[];
  blockers?: unknown[];
  validation?: {
    privacy?: { status?: string; notes?: string };
    alignment?: { status?: string; notes?: string };
    accessibility?: { status?: string; notes?: string };
    human_review_required?: { required?: boolean; reason?: string };
  };
  outputs?: {
    drafts?: unknown[];
    exports?: unknown[];
  };
  next_action?: {
    mode?: string;
    message?: string;
  };
}

export async function readCurrentTask(workspace: string): Promise<CurrentTask | undefined> {
  const text = await readText(workspacePath(workspace, "cubby/state/current-task.yaml"));
  return text ? (YAML.parse(text) as CurrentTask) : undefined;
}

export async function writeCurrentTask(workspace: string, currentTask: CurrentTask): Promise<void> {
  await writeText(workspacePath(workspace, "cubby/state/current-task.yaml"), YAML.stringify(currentTask));
}

export async function readManifest(workspace: string): Promise<Manifest | undefined> {
  const text = await readText(workspacePath(workspace, "cubby/manifest.yaml"));
  return text ? (YAML.parse(text) as Manifest) : undefined;
}
