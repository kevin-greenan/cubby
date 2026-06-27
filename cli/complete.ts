import path from "node:path";
import type { CompleteOptions } from "./types.js";
import { readCurrentTask, writeCurrentTask, type CurrentTask } from "./workspace.js";

export async function runComplete(options: CompleteOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const currentTask = await readCurrentTask(workspace);
  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }
  if (!currentTask.task?.workflow || currentTask.task.status === "not_started") {
    console.error("failed\tcomplete\tno active task; run cubby start first");
    return 1;
  }

  const reviewRequired = currentTask.validation?.human_review_required?.required === true;
  if (reviewRequired && !options.reviewed) {
    console.error("failed\tcomplete\thuman review is required; rerun with --reviewed after review");
    return 1;
  }

  const reviewed = reviewRequired && options.reviewed;
  markComplete(currentTask, reviewed, options.note);
  await writeCurrentTask(workspace, currentTask);

  console.log("Cubby task completed.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Task: ${currentTask.task?.id ?? ""}`);
  console.log(`Workflow: ${currentTask.task?.workflow ?? ""}`);
  console.log(`Status: ${currentTask.task?.status ?? ""}`);
  console.log(`Review recorded: ${reviewed}`);
  console.log(`Instruction: ${currentTask.next_action?.message ?? ""}`);
  return 0;
}

function markComplete(currentTask: CurrentTask, reviewed: boolean, note: string | undefined): void {
  currentTask.task = {
    ...currentTask.task,
    status: "complete"
  };
  if (reviewed && currentTask.validation?.human_review_required) {
    currentTask.validation.human_review_required = {
      required: false,
      reason: note ? `Human review completed: ${note}` : "Human review completed."
    };
  }
  currentTask.decisions = [
    ...(currentTask.decisions ?? []),
    {
      phase: currentTask.task?.phase ?? "",
      note: note ?? (reviewed ? "Human review completed and task marked complete." : "Task marked complete."),
      reviewed,
      created_at: new Date().toISOString()
    }
  ];
  currentTask.next_action = {
    mode: "complete",
    message: reviewed
      ? "Task is complete and required human review is recorded; reviewed outputs may be exported or handed off."
      : "Task is complete; review outputs and create or inspect the handoff."
  };
}
