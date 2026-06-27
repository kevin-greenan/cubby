import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { CUBBY_VERSION, PROFILE_DEFAULTS } from "./constants.js";
import { markdownHeader, yamlHeader } from "./fs-utils.js";

const REPO_ROOT = process.cwd();

async function readRepoFile(relativePath: string): Promise<string> {
  return readFile(path.join(REPO_ROOT, relativePath), "utf8");
}

export async function renderedAgents(profile: string): Promise<string> {
  const template = await readRepoFile("src/adapters/codex/AGENTS.md.template");
  return `${markdownHeader()}${template
    .replaceAll("{{profile}}", profile)
    .replaceAll("{{cubby_version}}", CUBBY_VERSION)}`;
}

export function renderedVersion(): string {
  return `${CUBBY_VERSION}\n`;
}

export function renderedConfig(profile: string, adapter: string): string {
  const defaults = PROFILE_DEFAULTS[profile] ?? {
    agents: ["classroom-orchestrator"],
    subagents: ["lesson-architect"],
    commands: ["lesson-plan"]
  };
  return `${yamlHeader()}${YAML.stringify({
    cubby_version: CUBBY_VERSION,
    profile,
    adapter,
    enabled: {
      agents: defaults.agents,
      subagents: defaults.subagents,
      commands: defaults.commands
    },
    autonomy: {
      mode: "guided",
      allow_autonomous: ["lesson-plan", "lesson-pack", "sub-plan", "rubric", "data-tracker"],
      require_human_gate: [
        "parent-email",
        "iep-goal-support",
        "behavior-routine",
        "progress-summary",
        "student-specific-accommodation"
      ],
      allow_exports_without_review: ["generic lesson materials", "blank templates"],
      block_exports_without_review: [
        "family communication",
        "student-specific records",
        "IEP-related summaries",
        "behavior-related summaries"
      ]
    },
    outputs: {
      root: "cubby/outputs",
      exports: "cubby/exports"
    },
    validation: {
      human_review_required_for_sensitive_outputs: true
    }
  })}`;
}

export function renderedCurrentTask(): string {
  return `${yamlHeader()}${YAML.stringify({
    task: {
      id: "task-not-started",
      title: "",
      workflow: "",
      status: "not_started",
      phase: "",
      risk_level: "low"
    },
    context: {
      grade: "",
      subject: "",
      topic: "",
      duration_minutes: null,
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
      strategy: "none",
      fanout: {
        status: "not_started",
        requested: [],
        completed: []
      },
      calls: []
    },
    decisions: [],
    blockers: [],
    validation: {
      privacy: {
        status: "not_run",
        notes: ""
      },
      alignment: {
        status: "not_run",
        notes: ""
      },
      accessibility: {
        status: "not_run",
        notes: ""
      },
      human_review_required: {
        required: false,
        reason: ""
      }
    },
    outputs: {
      drafts: [],
      exports: []
    },
    next_action: {
      mode: "continue",
      message: ""
    }
  })}`;
}

export function localFileContent(relativePath: string): string {
  switch (relativePath) {
    case "cubby/local/teacher-preferences.yaml":
      return YAML.stringify({
        teacher_preferences: {
          tone: "warm, clear, professional",
          notes: "Add local preferences here."
        }
      });
    case "cubby/local/classroom-context.yaml":
      return YAML.stringify({
        classroom_context: {
          grade: "",
          subjects: [],
          notes: "Avoid adding unnecessary student-identifying information."
        }
      });
    case "cubby/local/schedule.yaml":
      return YAML.stringify({
        schedule: {
          notes: "Add classroom schedule details here."
        }
      });
    case "cubby/local/curriculum-map.md":
      return "# Curriculum Map\n\nAdd curriculum notes, pacing, and standards references here.\n";
    case "cubby/local/students/README.md":
      return "# Student Context\n\nUse pseudonyms or initials where possible. Avoid unnecessary sensitive details.\n";
    case "cubby/local/students/students.example.yaml":
      return YAML.stringify({
        students: [
          {
            label: "Student A",
            notes: "Use student-neutral labels in examples."
          }
        ]
      });
    default:
      return "";
  }
}
