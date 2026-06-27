import path from "node:path";
import YAML from "yaml";
import { exists, writeText } from "./fs-utils.js";
import type { ScaffoldOptions } from "./types.js";

const VALID_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function runScaffold(options: ScaffoldOptions): Promise<number> {
  const kind = options.kind;
  const name = options.name;
  if (kind !== "workflow" && kind !== "agent") {
    console.error("failed\tscaffold kind must be workflow or agent");
    return 1;
  }
  if (!name || !VALID_NAME.test(name)) {
    console.error("failed\tscaffold name must be lowercase kebab-case");
    return 1;
  }

  const target = kind === "workflow" ? `src/workflows/${name}.yaml` : `src/agents/${name}.md`;
  const root = path.resolve(options.root);
  const absoluteTarget = path.resolve(root, target);
  if (await exists(absoluteTarget)) {
    console.error(`failed\t${target}\talready exists`);
    return 1;
  }

  await writeText(absoluteTarget, kind === "workflow" ? workflowContent(name) : agentContent(name));
  console.log("Cubby scaffold created.");
  console.log(`Kind: ${kind}`);
  console.log(`Path: ${target}`);
  return 0;
}

function workflowContent(name: string): string {
  return YAML.stringify({
    id: name,
    name: titleize(name),
    description: "Describe the educator workflow this protocol supports.",
    risk_level: "medium",
    phases: ["intake", "draft", "review", "validation", "handoff"],
    subagents: {
      strategy: "sequential",
      recommended: ["privacy-safeguards-reviewer"],
      fanout_groups: [
        {
          phase: "review",
          agents: ["privacy-safeguards-reviewer"]
        }
      ]
    },
    outputs: [
      {
        type: "markdown",
        path_template: `cubby/outputs/${name}/{{task_slug}}/draft.md`
      }
    ],
    gates: {
      human_review_required: true,
      validators: ["privacy-check"]
    },
    autonomy: {
      guided: "draft_with_checkpoints",
      managed: "draft_validate_pause",
      autonomous: "disabled"
    }
  });
}

function agentContent(name: string): string {
  return [
    `# ${titleize(name)}`,
    "",
    "Purpose: Describe this specialist's narrow role in Cubby workflows.",
    "",
    "Responsibilities:",
    "",
    "* Use teacher-provided context and Cubby workflow state.",
    "* Return bounded findings, assumptions, draft content, and review notes.",
    "* Do not approve sensitive outputs or replace professional judgment.",
    "",
    "Human review:",
    "",
    "* Escalate parent communication, IEP-adjacent content, behavior-support recommendations, progress interpretation, and student-specific recommendations.",
    ""
  ].join("\n");
}

function titleize(name: string): string {
  return name
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
