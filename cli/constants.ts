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

export const USER_OWNED_DIRS = [
  "cubby/local/",
  "cubby/templates/custom/",
  "cubby/outputs/",
  "cubby/exports/",
  "cubby/logs/"
];

export const WORKSPACE_DIRS = [
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
  "cubby/logs/handoffs"
];

export const LOCAL_FILES = [
  "cubby/local/teacher-preferences.yaml",
  "cubby/local/classroom-context.yaml",
  "cubby/local/schedule.yaml",
  "cubby/local/curriculum-map.md",
  "cubby/local/students/README.md",
  "cubby/local/students/students.example.yaml"
];
