import path from "node:path";
import { readCurrentTask, readManifest } from "./workspace.js";
import type { StatusOptions } from "./types.js";

export async function runStatus(options: StatusOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const currentTask = await readCurrentTask(workspace);
  const manifest = await readManifest(workspace);

  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }

  const task = currentTask.task ?? {};

  console.log("Cubby status");
  console.log(`Workspace: ${workspace}`);
  console.log(`Task: ${task.id ?? ""}`);
  console.log(`Title: ${task.title ?? ""}`);
  console.log(`Workflow: ${task.workflow ?? ""}`);
  console.log(`Status: ${task.status ?? ""}`);
  console.log(`Phase: ${task.phase ?? ""}`);
  console.log(`Risk: ${task.risk_level ?? ""}`);
  console.log(`Subagent strategy: ${currentTask.subagents?.strategy ?? "none"}`);
  console.log(`Subagent calls: ${currentTask.subagents?.calls?.length ?? 0}`);
  console.log(`Subagent fanout: ${currentTask.subagents?.fanout?.status ?? "not_started"}`);
  console.log(`Human review required: ${currentTask.validation?.human_review_required?.required ?? false}`);
  console.log(`Next action: ${currentTask.next_action?.mode ?? ""}`);
  console.log(`Drafts: ${currentTask.outputs?.drafts?.length ?? 0}`);
  console.log(`Exports: ${currentTask.outputs?.exports?.length ?? 0}`);
  console.log(`Managed files: ${manifest?.managed_files?.length ?? 0}`);
  return 0;
}
