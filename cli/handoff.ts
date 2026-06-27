import path from "node:path";
import { readCurrentTask, readManifest } from "./workspace.js";
import { writeText, workspacePath } from "./fs-utils.js";
import type { HandoffOptions } from "./types.js";

export async function runHandoff(options: HandoffOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const currentTask = await readCurrentTask(workspace);
  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }

  const manifest = await readManifest(workspace);
  const task = currentTask.task ?? {};
  const taskId = task.id || "task-not-started";
  const outputPath = `cubby/logs/handoffs/${taskId}.handoff.md`;
  const item = (label: string, value: unknown): string => `- ${label}: ${value ?? ""}`.trimEnd();
  const content = [
    "# Cubby Handoff",
    "",
    item("Task", taskId),
    item("Title", task.title),
    item("Workflow", task.workflow),
    item("Status", task.status),
    item("Phase", task.phase),
    item("Risk", task.risk_level),
    item("Subagent strategy", currentTask.subagents?.strategy ?? "none"),
    item("Subagent calls", currentTask.subagents?.calls?.length ?? 0),
    item("Subagent fanout status", currentTask.subagents?.fanout?.status ?? "not_started"),
    item("Human review required", currentTask.validation?.human_review_required?.required ?? false),
    item("Human review reason", currentTask.validation?.human_review_required?.reason),
    item("Draft outputs", currentTask.outputs?.drafts?.length ?? 0),
    item("Exports", currentTask.outputs?.exports?.length ?? 0),
    item("Decisions", currentTask.decisions?.length ?? 0),
    item("Blockers", currentTask.blockers?.length ?? 0),
    item("Managed files", manifest?.managed_files?.length ?? 0),
    "",
    "## Next Action",
    "",
    `Mode: ${currentTask.next_action?.mode ?? ""}`,
    "",
    currentTask.next_action?.message ?? "",
    "",
    "## Review Notes",
    "",
    "Review sensitive outputs before use. Parent/family communication, IEP-adjacent text, behavior-support recommendations, progress interpretation, and student-specific accommodation recommendations require human review."
  ].join("\n");

  await writeText(workspacePath(workspace, outputPath), `${content}\n`);
  console.log("Cubby handoff written.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Path: ${outputPath}`);
  return 0;
}
