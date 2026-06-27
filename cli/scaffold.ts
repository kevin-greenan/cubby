import path from "node:path";
import YAML from "yaml";
import { exists, writeText } from "./fs-utils.js";
import type { ScaffoldOptions } from "./types.js";

const VALID_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function runScaffold(options: ScaffoldOptions): Promise<number> {
  const kind = options.kind;
  const name = options.name;
  if (kind !== "workflow" && kind !== "agent" && kind !== "pack") {
    console.error("failed\tscaffold kind must be workflow, agent, or pack");
    return 1;
  }
  if (!name || !VALID_NAME.test(name)) {
    console.error("failed\tscaffold name must be lowercase kebab-case");
    return 1;
  }

  const target = targetPath(kind, name);
  const root = path.resolve(options.root);
  const absoluteTarget = path.resolve(root, target);
  if (await exists(absoluteTarget)) {
    console.error(`failed\t${target}\talready exists`);
    return 1;
  }

  await writeText(absoluteTarget, scaffoldContent(kind, name, options.need));
  console.log("Cubby scaffold created.");
  console.log(`Kind: ${kind}`);
  console.log(`Path: ${target}`);
  return 0;
}

function targetPath(kind: "workflow" | "agent" | "pack", name: string): string {
  if (kind === "workflow") {
    return `src/workflows/${name}.yaml`;
  }
  if (kind === "agent") {
    return `src/agents/${name}.md`;
  }
  return `src/packs/${name}.yaml`;
}

function scaffoldContent(kind: "workflow" | "agent" | "pack", name: string, need: string | undefined): string {
  if (kind === "workflow") {
    return workflowContent(name);
  }
  if (kind === "agent") {
    return agentContent(name);
  }
  return packContent(name, need);
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

function packContent(name: string, need: string | undefined): string {
  return YAML.stringify({
    id: name,
    name: titleize(name),
    description: "Describe the workflow family this pack adds or extends.",
    unmet_use_case: need ?? "Describe the unmet use case this pack addresses.",
    status: "draft",
    scope: {
      include: ["Add one to three concrete use cases this pack should cover."],
      exclude: ["Add adjacent use cases this pack should not cover."]
    },
    workflows: [],
    commands: [],
    agents: [],
    templates: [],
    validators: ["privacy-check"],
    hooks: [],
    tools: [],
    skills: [],
    quality_checks: [
      "Confirm no active pack already covers this use case.",
      "Keep assets tightly scoped to the stated include/exclude boundaries.",
      "Run cubby validate against a generated workspace before activating the pack."
    ],
    review_gates: {
      human_review_required_for_sensitive_outputs: true,
      notes: "Add pack-specific review requirements here."
    }
  });
}

function titleize(name: string): string {
  return name
    .split("-")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}
