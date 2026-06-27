import path from "node:path";
import { readCurrentTask } from "./workspace.js";
import type { ResumeOptions } from "./types.js";

export async function runResume(options: ResumeOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const currentTask = await readCurrentTask(workspace);
  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }

  const task = currentTask.task ?? {};
  const next = currentTask.next_action ?? {};
  console.log("Cubby resume");
  console.log(`Workspace: ${workspace}`);
  console.log(`Task: ${task.id ?? ""}`);
  console.log(`Workflow: ${task.workflow || "not selected"}`);
  console.log(`Status: ${task.status ?? ""}`);
  console.log(`Phase: ${task.phase || "not started"}`);
  console.log(`Subagent strategy: ${currentTask.subagents?.strategy ?? "none"}`);
  console.log(`Subagent fanout: ${currentTask.subagents?.fanout?.status ?? "not_started"}`);

  if (task.status === "blocked") {
    console.log("Instruction: stop and resolve blockers before continuing.");
  } else if (next.mode === "pause_for_review" || (task.status === "waiting_for_review" && currentTask.validation?.human_review_required?.required)) {
    console.log("Instruction: pause for human review before continuing or exporting.");
  } else if (task.status === "complete" || next.mode === "complete") {
    console.log("Instruction: task is complete; create or review handoff.");
  } else {
    console.log("Instruction: load the command and workflow files from cubby/framework/, continue the current phase, then run cubby advance.");
  }

  if (next.message) {
    console.log(`Next message: ${next.message}`);
  }
  return 0;
}
