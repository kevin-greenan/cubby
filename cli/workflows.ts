import YAML from "yaml";
import { readText, workspacePath } from "./fs-utils.js";

export interface WorkflowDefinition {
  id?: string;
  name?: string;
  description?: string;
  risk_level?: "low" | "medium" | "high";
  phases?: string[];
  subagents?: {
    strategy?: "none" | "sequential" | "parallel" | "fanout_fanin";
    recommended?: string[];
    fanout_groups?: Array<{
      phase?: string;
      agents?: string[];
    }>;
  };
  outputs?: Array<{
    type?: string;
    path_template?: string;
  }>;
  gates?: {
    human_review_required?: boolean;
    validators?: string[];
  };
}

export async function readWorkflow(workspace: string, workflowId: string): Promise<WorkflowDefinition | undefined> {
  const text = await readText(workspacePath(workspace, `cubby/framework/workflows/${workflowId}.yaml`));
  return text ? (YAML.parse(text) as WorkflowDefinition) : undefined;
}

export function agentsForPhase(workflow: WorkflowDefinition, phase: string): string[] {
  return workflow.subagents?.fanout_groups?.find((group) => group.phase === phase)?.agents ?? [];
}

export function nextPhase(workflow: WorkflowDefinition, currentPhase: string | undefined): string | undefined {
  const phases = workflow.phases ?? [];
  const index = phases.findIndex((phase) => phase === currentPhase);
  if (index < 0) {
    return phases[0];
  }
  return phases[index + 1];
}

export function plannedOutputPaths(workflow: WorkflowDefinition, taskSlug: string): string[] {
  return (workflow.outputs ?? [])
    .map((output) => output.path_template?.replaceAll("{{task_slug}}", taskSlug))
    .filter((value): value is string => Boolean(value));
}

export function taskSlugFromId(workflowId: string, taskId: string | undefined): string {
  return (taskId ?? "").replace(new RegExp(`^${escapeRegExp(workflowId)}-`), "") || "task";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
