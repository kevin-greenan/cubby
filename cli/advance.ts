import path from "node:path";
import { readCurrentTask, writeCurrentTask, type CurrentTask } from "./workspace.js";
import { agentsForPhase, nextPhase, readWorkflow } from "./workflows.js";
import type { AdvanceOptions } from "./types.js";

const VALID_STATUSES = ["in_progress", "blocked", "waiting_for_review", "complete"] as const;

export async function runAdvance(options: AdvanceOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  const currentTask = await readCurrentTask(workspace);
  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }
  const workflowId = currentTask.task?.workflow;
  if (!workflowId) {
    console.error("failed\tcubby/state/current-task.yaml\tcurrent task has no workflow; run cubby start first");
    return 1;
  }
  const workflow = await readWorkflow(workspace, workflowId);
  if (!workflow) {
    console.error(`failed\tcubby/framework/workflows/${workflowId}.yaml\tworkflow not found`);
    return 1;
  }

  const targetPhase = options.phase ?? nextPhase(workflow, currentTask.task?.phase);
  if (!targetPhase) {
    currentTask.task = {
      ...currentTask.task,
      status: "complete",
      phase: currentTask.task?.phase ?? ""
    };
    currentTask.next_action = {
      mode: "complete",
      message: "Task phases are complete; review outputs and create or inspect the handoff."
    };
    await writeCurrentTask(workspace, currentTask);
    printResult(workspace, currentTask);
    return 0;
  }
  if (!(workflow.phases ?? []).includes(targetPhase)) {
    console.error(`failed\tadvance\tphase is not part of workflow: ${targetPhase}`);
    return 1;
  }
  if (options.status && !VALID_STATUSES.includes(options.status as (typeof VALID_STATUSES)[number])) {
    console.error(`failed\tadvance\tinvalid status: ${options.status}`);
    return 1;
  }

  if (options.completeSubagents) {
    completeSubagents(currentTask);
  }

  const status = options.status ?? statusForPhase(targetPhase);
  currentTask.task = {
    ...currentTask.task,
    status,
    phase: targetPhase
  };
  currentTask.subagents = currentTask.subagents ?? {
    strategy: workflow.subagents?.strategy ?? "none",
    fanout: { status: "complete", requested: [], completed: [] },
    calls: []
  };
  currentTask.subagents.strategy = workflow.subagents?.strategy ?? currentTask.subagents.strategy ?? "none";
  seedPhaseSubagents(currentTask, workflowId, targetPhase, agentsForPhase(workflow, targetPhase));

  if (options.note) {
    currentTask.decisions = [...(currentTask.decisions ?? []), { phase: targetPhase, note: options.note, created_at: new Date().toISOString() }];
  }

  const reviewRequired = currentTask.validation?.human_review_required?.required === true;
  currentTask.next_action = {
    mode: status === "complete" ? "complete" : status === "waiting_for_review" ? "pause_for_review" : "continue",
    message: messageForPhase(workflowId, targetPhase, status, reviewRequired)
  };

  await writeCurrentTask(workspace, currentTask);
  printResult(workspace, currentTask);
  return 0;
}

function seedPhaseSubagents(currentTask: CurrentTask, workflowId: string, phase: string, agents: string[]): void {
  const existingCalls = currentTask.subagents?.calls ?? [];
  const existingKeys = new Set(existingCalls.map((call) => `${String(call.agent)}:${String(call.inputs?.phase ?? "")}`));
  const newCalls = agents
    .filter((agent) => !existingKeys.has(`${agent}:${phase}`))
    .map((agent, index) => ({
      id: `${currentTask.task?.id ?? workflowId}-${phase}-${index + 1}-${agent}`,
      agent,
      purpose: `Support ${phase} phase for ${workflowId}.`,
      status: "pending",
      inputs: {
        workflow: workflowId,
        phase,
        title: currentTask.task?.title ?? "",
        context: currentTask.context ?? {}
      },
      outputs: [],
      notes: ""
    }));
  const completed = currentTask.subagents?.fanout?.completed ?? [];
  currentTask.subagents = {
    strategy: currentTask.subagents?.strategy ?? "none",
    fanout: {
      status: agents.length > 0 ? "not_started" : "complete",
      requested: agents,
      completed: completed.filter((agent) => agents.includes(String(agent)))
    },
    calls: [...existingCalls, ...newCalls]
  };
}

function completeSubagents(currentTask: CurrentTask): void {
  const requested = (currentTask.subagents?.fanout?.requested ?? []).map(String);
  currentTask.subagents = {
    strategy: currentTask.subagents?.strategy ?? "none",
    fanout: {
      status: "complete",
      requested,
      completed: Array.from(new Set([...(currentTask.subagents?.fanout?.completed ?? []).map(String), ...requested]))
    },
    calls: (currentTask.subagents?.calls ?? []).map((call) => ({
      ...call,
      status: call.status === "pending" || call.status === "running" ? "complete" : call.status
    }))
  };
}

function statusForPhase(phase: string): "in_progress" | "waiting_for_review" {
  return phase === "human_gate" ? "waiting_for_review" : "in_progress";
}

function messageForPhase(workflowId: string, phase: string, status: string, reviewRequired: boolean): string {
  if (status === "waiting_for_review") {
    return "Pause for human review. Continue only after the teacher or qualified professional has reviewed the draft.";
  }
  if (status === "complete") {
    return "Task is complete; review outputs and create or inspect the handoff.";
  }
  if (phase === "validation") {
    return "Run validation checks, update validation results, and address any warnings before handoff or export.";
  }
  if (phase === "handoff") {
    return "Create or update the handoff with assumptions, outputs, validation state, and next steps.";
  }
  const reviewNote = reviewRequired ? " Keep required human review before export or final use." : "";
  return `Load cubby/framework/commands/${workflowId}.md and cubby/framework/workflows/${workflowId}.yaml, complete the ${phase} phase, then update cubby/state/current-task.yaml.${reviewNote}`;
}

function printResult(workspace: string, currentTask: CurrentTask): void {
  console.log("Cubby task advanced.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Task: ${currentTask.task?.id ?? ""}`);
  console.log(`Workflow: ${currentTask.task?.workflow ?? ""}`);
  console.log(`Status: ${currentTask.task?.status ?? ""}`);
  console.log(`Phase: ${currentTask.task?.phase ?? ""}`);
  console.log(`Subagent fanout: ${currentTask.subagents?.fanout?.status ?? "not_started"}`);
  console.log(`Subagent requested: ${(currentTask.subagents?.fanout?.requested ?? []).join(", ") || "none"}`);
  console.log(`Next action: ${currentTask.next_action?.mode ?? ""}`);
  console.log(`Instruction: ${currentTask.next_action?.message ?? ""}`);
}
