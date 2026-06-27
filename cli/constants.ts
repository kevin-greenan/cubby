export const CUBBY_VERSION = "0.1.0";

export const MANAGED_VERSION = "0.1.0";

export const SUPPORTED_ADAPTERS = ["codex"] as const;

export const SUPPORTED_PROFILES = [
  "k5-general",
  "k5-special-ed",
  "instructional-coach",
  "bcba-support",
  "interventionist"
] as const;

export const PROFILE_DEFAULTS: Record<string, { agents: string[]; subagents: string[]; commands: string[] }> = {
  "k5-general": {
    agents: [
      "classroom-orchestrator",
      "lesson-architect",
      "curriculum-alignment-specialist",
      "differentiation-specialist",
      "materials-designer",
      "family-communication-specialist",
      "privacy-safeguards-reviewer"
    ],
    subagents: [
      "lesson-architect",
      "curriculum-alignment-specialist",
      "differentiation-specialist",
      "materials-designer",
      "family-communication-specialist",
      "privacy-safeguards-reviewer"
    ],
    commands: ["lesson-plan", "lesson-pack", "parent-email", "sub-plan", "data-tracker", "start", "advance", "status", "resume", "handoff", "artifacts", "export", "redact", "manifest", "packs", "upgrade"]
  },
  "k5-special-ed": {
    agents: [
      "classroom-orchestrator",
      "lesson-architect",
      "differentiation-specialist",
      "iep-support-specialist",
      "behavior-support-specialist",
      "data-progress-specialist",
      "family-communication-specialist",
      "privacy-safeguards-reviewer",
      "accessibility-language-reviewer"
    ],
    subagents: [
      "lesson-architect",
      "differentiation-specialist",
      "iep-support-specialist",
      "behavior-support-specialist",
      "data-progress-specialist",
      "family-communication-specialist",
      "privacy-safeguards-reviewer",
      "accessibility-language-reviewer"
    ],
    commands: ["lesson-plan", "lesson-pack", "accommodation-check", "iep-goal-support", "data-tracker", "behavior-routine", "parent-email", "sub-plan", "start", "advance", "status", "resume", "handoff", "artifacts", "export", "redact", "manifest", "packs", "upgrade"]
  },
  "instructional-coach": {
    agents: ["classroom-orchestrator", "lesson-architect", "curriculum-alignment-specialist", "accessibility-language-reviewer", "admin-lens-reviewer"],
    subagents: ["lesson-architect", "curriculum-alignment-specialist", "accessibility-language-reviewer", "admin-lens-reviewer"],
    commands: ["lesson-plan", "lesson-pack", "data-tracker", "start", "advance", "artifacts", "export", "redact", "packs"]
  },
  "bcba-support": {
    agents: ["classroom-orchestrator", "behavior-support-specialist", "data-progress-specialist", "privacy-safeguards-reviewer", "family-communication-specialist", "admin-lens-reviewer"],
    subagents: ["behavior-support-specialist", "data-progress-specialist", "privacy-safeguards-reviewer", "family-communication-specialist", "admin-lens-reviewer"],
    commands: ["behavior-routine", "data-tracker", "parent-email", "start", "advance", "artifacts", "export", "redact", "packs"]
  },
  interventionist: {
    agents: ["classroom-orchestrator", "lesson-architect", "differentiation-specialist", "data-progress-specialist", "materials-designer", "privacy-safeguards-reviewer"],
    subagents: ["lesson-architect", "differentiation-specialist", "data-progress-specialist", "materials-designer", "privacy-safeguards-reviewer"],
    commands: ["lesson-plan", "data-tracker", "parent-email", "start", "advance", "artifacts", "export", "redact", "packs"]
  }
};

export const USER_OWNED_DIRS = [
  "cubby/local/",
  "cubby/templates/custom/",
  "cubby/outputs/",
  "cubby/exports/",
  "cubby/logs/"
];

export const WORKSPACE_DIRS = [
  "cubby/framework",
  "cubby/state/history",
  "cubby/local/standards",
  "cubby/local/accommodations",
  "cubby/local/students",
  "cubby/templates/custom",
  "cubby/outputs/lesson-packs",
  "cubby/outputs/parent-emails",
  "cubby/outputs/sub-plans",
  "cubby/outputs/data-trackers",
  "cubby/outputs/meeting-prep",
  "cubby/outputs/behavior-support",
  "cubby/outputs/iep-support",
  "cubby/exports/markdown",
  "cubby/exports/docx",
  "cubby/exports/xlsx",
  "cubby/exports/pptx",
  "cubby/exports/google-docs",
  "cubby/exports/word",
  "cubby/exports/slides",
  "cubby/exports/sheets",
  "cubby/logs/decisions",
  "cubby/logs/validations",
  "cubby/logs/artifacts",
  "cubby/logs/redactions",
  "cubby/logs/handoffs"
];

export const FRAMEWORK_SOURCE_DIRS = [
  "src/adapters",
  "src/agents",
  "src/commands",
  "src/extensions",
  "src/hooks",
  "src/packs",
  "src/profiles",
  "src/rules",
  "src/schemas",
  "src/skills",
  "src/subagents",
  "src/templates",
  "src/tools",
  "src/validators",
  "src/workflows"
];

export const LOCAL_FILES = [
  "cubby/local/teacher-preferences.yaml",
  "cubby/local/classroom-context.yaml",
  "cubby/local/schedule.yaml",
  "cubby/local/curriculum-map.md",
  "cubby/local/students/README.md",
  "cubby/local/students/students.example.yaml"
];
