import path from "node:path";
import { readCurrentTask, writeCurrentTask } from "./workspace.js";
import { agentsForPhase, readWorkflow, type WorkflowDefinition } from "./workflows.js";
import type { StartOptions } from "./types.js";
import type { CurrentTask } from "./workspace.js";

export async function runStart(options: StartOptions): Promise<number> {
  const workspace = path.resolve(options.workspace);
  if (!options.workflow) {
    console.error("failed\tstart\tworkflow is required");
    return 1;
  }

  const currentTask = await readCurrentTask(workspace);
  if (!currentTask) {
    console.error("failed\tcubby/state/current-task.yaml\tmissing current task file");
    return 1;
  }
  if (!options.force && currentTask.task?.status && !["not_started", "complete"].includes(currentTask.task.status)) {
    console.error("failed\tcubby/state/current-task.yaml\tcurrent task is active; use --force to replace it");
    return 1;
  }

  const workflow = await readWorkflow(workspace, options.workflow);
  if (!workflow) {
    console.error(`failed\tcubby/framework/workflows/${options.workflow}.yaml\tworkflow not found`);
    return 1;
  }

  const title = options.title ?? workflow.name ?? titleize(options.workflow);
  const taskSlug = slugify(title) || options.workflow;
  const phase = workflow.phases?.[0] ?? "intake";
  const duration = parseDuration(options.duration);
  if (options.duration !== undefined && duration === undefined) {
    console.error("failed\tstart\t--duration must be a non-negative integer");
    return 1;
  }

  const startedTask = buildCurrentTask(workflow, {
    workflowId: options.workflow,
    title,
    taskSlug,
    phase,
    grade: options.grade ?? "",
    subject: options.subject ?? "",
    topic: options.topic ?? "",
    durationMinutes: duration ?? null
  });

  await writeCurrentTask(workspace, startedTask);

  console.log("Cubby workflow started.");
  console.log(`Workspace: ${workspace}`);
  console.log(`Task: ${startedTask.task?.id ?? ""}`);
  console.log(`Workflow: ${options.workflow}`);
  console.log(`Title: ${title}`);
  console.log(`Phase: ${phase}`);
  console.log(`Risk: ${workflow.risk_level ?? "low"}`);
  console.log(`Subagent strategy: ${startedTask.subagents?.strategy ?? "none"}`);
  console.log(`Subagent calls: ${startedTask.subagents?.calls?.length ?? 0}`);
  console.log(`Human review required: ${startedTask.validation?.human_review_required?.required ?? false}`);
  console.log(`Instruction: ${startedTask.next_action?.message ?? ""}`);
  return 0;
}

function buildCurrentTask(
  workflow: WorkflowDefinition,
  options: {
    workflowId: string;
    title: string;
    taskSlug: string;
    phase: string;
    grade: string;
    subject: string;
    topic: string;
    durationMinutes: number | null;
  }
): CurrentTask {
  const validators = workflow.gates?.validators ?? [];
  const recommendedAgents = workflow.subagents?.recommended ?? [];
  const firstPhaseAgents = agentsForPhase(workflow, options.phase);
  const requestedAgents = firstPhaseAgents.length > 0 ? firstPhaseAgents : recommendedAgents;
  const humanReviewRequired = workflow.gates?.human_review_required === true;
  return {
    task: {
      id: `${options.workflowId}-${options.taskSlug}`,
      title: options.title,
      workflow: options.workflowId,
      status: "in_progress",
      phase: options.phase,
      risk_level: workflow.risk_level ?? "low"
    },
    context: {
      grade: options.grade,
      subject: options.subject,
      topic: options.topic,
      duration_minutes: options.durationMinutes,
      audience: [],
      platforms: {}
    },
    inputs: {
      sources: [],
      standards: [],
      materials: [],
      accommodations: {
        source: "",
        contains_student_identifiers: false
      }
    },
    agents: {
      orchestrator: "classroom-orchestrator",
      specialists_called: []
    },
    subagents: {
      strategy: workflow.subagents?.strategy ?? "none",
      fanout: {
        status: requestedAgents.length > 0 ? "not_started" : "complete",
        requested: requestedAgents,
        completed: []
      },
      calls: requestedAgents.map((agent, index) => ({
        id: `${options.taskSlug}-${index + 1}-${agent}`,
        agent,
        purpose: `Support ${options.phase} phase for ${options.workflowId}.`,
        status: "pending",
        inputs: {
          workflow: options.workflowId,
          phase: options.phase,
          title: options.title,
          context: {
            grade: options.grade,
            subject: options.subject,
            topic: options.topic
          }
        },
        outputs: [],
        notes: ""
      }))
    },
    decisions: [],
    blockers: [],
    validation: {
      privacy: {
        status: "not_run",
        notes: validators.includes("privacy-check") ? "Required by workflow." : ""
      },
      alignment: {
        status: "not_run",
        notes: validators.includes("alignment-check") ? "Required by workflow." : ""
      },
      accessibility: {
        status: "not_run",
        notes: validators.includes("accessibility-check") ? "Required by workflow." : ""
      },
      human_review_required: {
        required: humanReviewRequired,
        reason: humanReviewRequired ? "Workflow gate requires human review before export or final use." : ""
      }
    },
    outputs: {
      drafts: (workflow.outputs ?? []).map((output) => ({
        type: output.type ?? "markdown",
        path: (output.path_template ?? "").replaceAll("{{task_slug}}", options.taskSlug),
        status: "planned"
      })),
      exports: []
    },
    next_action: {
      mode: "continue",
      message: `Load cubby/framework/commands/${options.workflowId}.md and cubby/framework/workflows/${options.workflowId}.yaml, complete the ${options.phase} phase, then run cubby advance.`
    }
  };
}

function parseDuration(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleize(name: string): string {
  return name
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
