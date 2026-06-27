import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import YAML from "yaml";

const execFileAsync = promisify(execFile);
const cliPath = path.resolve("dist/cli/index.js");

test("init creates a valid Codex workspace", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    assert.match(await readFile(path.join(workspace, "AGENTS.md"), "utf8"), /Cubby Workspace Guide/);
    assert.equal(await readFile(path.join(workspace, ".cubby-version"), "utf8"), "0.1.0\n");
    assert.match(await readFile(path.join(workspace, "cubby/config.yaml"), "utf8"), /profile: k5-special-ed/);
    assert.match(await readFile(path.join(workspace, "cubby/config.yaml"), "utf8"), /enabled:/);
    assert.match(await readFile(path.join(workspace, "cubby/config.yaml"), "utf8"), /subagents:/);
    assert.match(await readFile(path.join(workspace, "cubby/config.yaml"), "utf8"), /iep-goal-support/);
    assert.match(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"), /status: not_started/);
    assert.match(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"), /strategy: none/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/commands/lesson-plan.md"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/commands/start.md"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/commands/advance.md"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/commands/redact.md"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/commands/scaffold.md"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/commands/packs.md"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/workflows/lesson-plan.yaml"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/packs/lesson-curriculum.yaml"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/packs/classroom-operations.yaml"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/skills/README.md"), "utf8"), /Skills/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/subagents/README.md"), "utf8"), /Subagents/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/tools/pack-design.md"), "utf8"), /Pack Design/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/templates/validation-summary.md"), "utf8"), /Validation Summary/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/templates/handoff.md"), "utf8"), /Handoff/);

    const manifest = YAML.parse(await readFile(path.join(workspace, "cubby/manifest.yaml"), "utf8"));
    assert.ok(
      manifest.managed_files.some(
        (entry) =>
          entry.path === "AGENTS.md" &&
          entry.source === "src/adapters/codex/AGENTS.md.template" &&
          entry.hash_algorithm === "sha256" &&
          entry.local_edits_policy === "preserve"
      )
    );
    assert.ok(
      manifest.managed_files.some(
        (entry) =>
          entry.path === "cubby/framework/commands/lesson-plan.md" &&
          entry.source === "src/commands/lesson-plan.md" &&
          entry.hash_algorithm === "sha256"
      )
    );
    assert.ok(
      manifest.managed_files.some(
        (entry) =>
          entry.path === "cubby/framework/subagents/README.md" &&
          entry.source === "src/subagents/README.md" &&
          entry.hash_algorithm === "sha256"
      )
    );

    await runCli(["validate", "--workspace", workspace]);
  });
});

test("repeat init preserves local customization and output files", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const preferencesPath = path.join(workspace, "cubby/local/teacher-preferences.yaml");
    const outputPath = path.join(workspace, "cubby/outputs/lesson-packs/draft.md");
    await writeFile(preferencesPath, "teacher_preferences:\n  tone: custom\n", "utf8");
    await writeFile(outputPath, "do not touch\n", "utf8");

    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    assert.equal(await readFile(preferencesPath, "utf8"), "teacher_preferences:\n  tone: custom\n");
    assert.equal(await readFile(outputPath, "utf8"), "do not touch\n");
  });
});

test("repeat init preserves locally edited managed files", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const agentsPath = path.join(workspace, "AGENTS.md");
    await writeFile(agentsPath, "local edit\n", "utf8");

    const result = await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    assert.match(result.stdout, /preserved-local-edit\tAGENTS.md/);
    assert.equal(await readFile(agentsPath, "utf8"), "local edit\n");
  });
});

test("repeat init preserves locally edited framework library files", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const commandPath = path.join(workspace, "cubby/framework/commands/lesson-plan.md");
    await writeFile(commandPath, "local command edit\n", "utf8");

    const result = await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    assert.match(result.stdout, /preserved-local-edit\tcubby\/framework\/commands\/lesson-plan.md/);
    assert.equal(await readFile(commandPath, "utf8"), "local command edit\n");
  });
});

test("validate fails when current task is malformed", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "cubby/state/current-task.yaml"), "task:\n  status: nope\n", "utf8");

    await assert.rejects(runCli(["validate", "--workspace", workspace]));
  });
});

test("validate writes a validation log", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    await runCli(["validate", "--workspace", workspace]);

    const validationsDir = path.join(workspace, "cubby/logs/validations");
    const entries = await readdir(validationsDir);
    assert.ok(entries.some((entry) => entry.startsWith("validation-") && entry.endsWith(".yaml")));
  });
});

test("validate warns on sensitive patterns in artifacts", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "cubby/outputs/parent-emails/draft.md"), "Email: family@example.com\n", "utf8");

    const result = await runCli(["validate", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby validation passed with warnings/);
    assert.match(result.stdout, /sensitive-pattern scan found 1 finding/);
  });
});

test("validate fails on broken pack references", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const packPath = path.join(workspace, "cubby/framework/packs/broken.yaml");
    await writeFile(
      packPath,
      [
        "id: broken",
        "name: Broken",
        "description: Broken pack for regression testing missing references in validation.",
        "unmet_use_case: Teachers need this regression pack to prove missing workflow references fail validation.",
        "status: active",
        "scope:",
        "  include:",
        "    - Regression coverage for pack reference validation.",
        "  exclude:",
        "    - Production workflow behavior.",
        "workflows:",
        "  - missing-workflow",
        "validators:",
        "  - privacy-check",
        "quality_checks:",
        "  - Confirm reference validation fails when a workflow is missing.",
        "  - Keep this fixture focused on the missing reference path.",
        "review_gates:",
        "  human_review_required_for_sensitive_outputs: true",
        "  notes: Regression fixture still models the human-review gate required by active packs.",
        ""
      ].join("\n"),
      "utf8"
    );

    await assert.rejects(runCli(["validate", "--workspace", workspace]));
  });
});

test("validate fails on underspecified active packs", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const packPath = path.join(workspace, "cubby/framework/packs/sloppy.yaml");
    await writeFile(
      packPath,
      [
        "id: sloppy",
        "name: Sloppy",
        "description: TBD placeholder pack",
        "unmet_use_case: TBD",
        "status: active",
        "scope:",
        "  include:",
        "    - TBD",
        "  exclude:",
        "    - TBD",
        "workflows: []",
        "validators: []",
        "quality_checks:",
        "  - TBD",
        "  - TODO",
        "review_gates:",
        "  human_review_required_for_sensitive_outputs: false",
        "  notes: TBD",
        ""
      ].join("\n"),
      "utf8"
    );

    await assert.rejects(runCli(["validate", "--workspace", workspace]));
  });
});

test("status summarizes current task and manifest", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    const result = await runCli(["status", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby status/);
    assert.match(result.stdout, /Task: task-not-started/);
    assert.match(result.stdout, /Status: not_started/);
    assert.match(result.stdout, /Subagent strategy: none/);
    assert.match(result.stdout, /Managed files: \d+/);
  });
});

test("start initializes current task from a workflow", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    const result = await runCli([
      "start",
      "lesson-plan",
      "--workspace",
      workspace,
      "--title",
      "Main Idea Lesson",
      "--grade",
      "2",
      "--subject",
      "ELA",
      "--topic",
      "main idea",
      "--duration",
      "45"
    ]);

    assert.match(result.stdout, /Cubby workflow started/);
    assert.match(result.stdout, /Task: lesson-plan-main-idea-lesson/);
    assert.match(result.stdout, /Subagent strategy: fanout_fanin/);
    assert.match(result.stdout, /Subagent calls: 5/);

    const currentTask = YAML.parse(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"));
    assert.equal(currentTask.task.id, "lesson-plan-main-idea-lesson");
    assert.equal(currentTask.task.workflow, "lesson-plan");
    assert.equal(currentTask.task.status, "in_progress");
    assert.equal(currentTask.task.phase, "intake");
    assert.equal(currentTask.context.grade, "2");
    assert.equal(currentTask.context.subject, "ELA");
    assert.equal(currentTask.context.topic, "main idea");
    assert.equal(currentTask.context.duration_minutes, 45);
    assert.equal(currentTask.subagents.strategy, "fanout_fanin");
    assert.deepEqual(currentTask.subagents.fanout.requested, [
      "lesson-architect",
      "curriculum-alignment-specialist",
      "differentiation-specialist",
      "materials-designer",
      "privacy-safeguards-reviewer"
    ]);
    assert.ok(currentTask.subagents.calls.every((call) => call.status === "pending"));
    assert.equal(currentTask.outputs.drafts[0].path, "cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md");
    assert.equal(currentTask.validation.human_review_required.required, false);
    assert.match(currentTask.next_action.message, /cubby\/framework\/commands\/lesson-plan.md/);

    await assert.rejects(runCli(["start", "parent-email", "--workspace", workspace]));
    await runCli(["start", "parent-email", "--workspace", workspace, "--title", "Conference Follow Up", "--force"]);
    const sensitiveTask = YAML.parse(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"));
    assert.equal(sensitiveTask.validation.human_review_required.required, true);
    assert.equal(sensitiveTask.next_action.mode, "continue");
    const resume = await runCli(["resume", "--workspace", workspace]);
    assert.match(resume.stdout, /Instruction: load the command and workflow files/);
  });
});

test("start validates workflow arguments", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    await assert.rejects(runCli(["start", "--workspace", workspace]));
    await assert.rejects(runCli(["start", "missing-workflow", "--workspace", workspace]));
    await assert.rejects(runCli(["start", "lesson-plan", "--workspace", workspace, "--duration", "nope"]));
  });
});

test("advance moves current task through workflow phases", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await runCli(["start", "lesson-plan", "--workspace", workspace, "--title", "Main Idea Lesson"]);

    const result = await runCli(["advance", "--workspace", workspace, "--complete-subagents", "--note", "Intake complete."]);

    assert.match(result.stdout, /Cubby task advanced/);
    assert.match(result.stdout, /Phase: context/);
    assert.match(result.stdout, /Subagent requested: none/);

    const currentTask = YAML.parse(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"));
    assert.equal(currentTask.task.phase, "context");
    assert.equal(currentTask.task.status, "in_progress");
    assert.equal(currentTask.subagents.fanout.status, "complete");
    assert.ok(currentTask.subagents.calls.every((call) => call.status === "complete"));
    assert.equal(currentTask.decisions[0].note, "Intake complete.");

    const review = await runCli(["advance", "--workspace", workspace, "--phase", "review"]);
    assert.match(review.stdout, /Phase: review/);
    const reviewTask = YAML.parse(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"));
    assert.deepEqual(reviewTask.subagents.fanout.requested, ["materials-designer", "privacy-safeguards-reviewer"]);

    await assert.rejects(runCli(["advance", "--workspace", workspace, "--phase", "not-a-phase"]));
    await assert.rejects(runCli(["advance", "--workspace", workspace, "--status", "invalid"]));
  });
});

test("validate checks active workflow state", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await runCli(["start", "lesson-plan", "--workspace", workspace, "--title", "Main Idea Lesson"]);

    const valid = await runCli(["validate", "--workspace", workspace]);
    assert.match(valid.stdout, /active workflow resolved/);
    assert.match(valid.stdout, /active workflow phase valid: intake/);
    assert.match(valid.stdout, /planned workflow output present/);

    const currentTaskPath = path.join(workspace, "cubby/state/current-task.yaml");
    const currentTask = YAML.parse(await readFile(currentTaskPath, "utf8"));
    currentTask.task.phase = "not-a-phase";
    await writeFile(currentTaskPath, YAML.stringify(currentTask), "utf8");

    await assert.rejects(runCli(["validate", "--workspace", workspace]));
  });
});

test("upgrade dry-run reports local edits without modifying files", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const agentsPath = path.join(workspace, "AGENTS.md");
    await writeFile(agentsPath, "local edit\n", "utf8");

    const result = await runCli(["upgrade", "--workspace", workspace, "--dry-run"]);

    assert.match(result.stdout, /Cubby upgrade dry run/);
    assert.match(result.stdout, /preserved-local-edit\tAGENTS.md/);
    assert.match(result.stdout, /Summary: /);
    assert.equal(await readFile(agentsPath, "utf8"), "local edit\n");
  });
});

test("upgrade without dry-run fails without modifying files", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    await assert.rejects(runCli(["upgrade", "--workspace", workspace]));
  });
});

test("manifest summarizes managed files and local edits", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "AGENTS.md"), "local edit\n", "utf8");

    const result = await runCli(["manifest", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby manifest/);
    assert.match(result.stdout, /Managed files: \d+/);
    assert.match(result.stdout, /Local edits: 1/);
  });
});

test("packs lists installed workflow packs", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    const result = await runCli(["packs", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby packs/);
    assert.match(result.stdout, /classroom-operations/);
    assert.match(result.stdout, /lesson-curriculum/);
    assert.match(result.stdout, /family-communication/);
    assert.match(result.stdout, /need: Teachers need a coordinated lesson-materials pack/);
    assert.match(result.stdout, /include: Lesson plans, lesson packs/);
    assert.match(result.stdout, /exclude: Official curriculum adoption/);
    assert.match(result.stdout, /workflows: lesson-plan, lesson-pack/);
    assert.match(result.stdout, /quality: Keep objectives, activities, materials/);
  });
});

test("resume prints next instruction", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    const result = await runCli(["resume", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby resume/);
    assert.match(result.stdout, /Subagent fanout: not_started/);
    assert.match(result.stdout, /Instruction:/);
  });
});

test("handoff writes handoff log", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);

    const result = await runCli(["handoff", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby handoff written/);
    const handoff = await readFile(path.join(workspace, "cubby/logs/handoffs/task-not-started.handoff.md"), "utf8");
    assert.match(handoff, /Cubby Handoff/);
    assert.match(handoff, /Subagent strategy: none/);
  });
});

test("artifacts writes an index for outputs and exports", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "cubby/outputs/lesson-packs/draft.md"), "# Draft\n", "utf8");
    await writeFile(path.join(workspace, "cubby/exports/markdown/export.md"), "# Export\n", "utf8");

    const result = await runCli(["artifacts", "--workspace", workspace]);

    assert.match(result.stdout, /Cubby artifact index written/);
    assert.match(result.stdout, /Artifacts: 2/);

    const index = YAML.parse(await readFile(path.join(workspace, "cubby/logs/artifacts/index.yaml"), "utf8"));
    assert.equal(index.artifact_count, 2);
    assert.equal(index.match_count, 2);
    assert.ok(index.artifacts.some((entry) => entry.path === "cubby/outputs/lesson-packs/draft.md"));
    assert.ok(index.artifacts.some((entry) => entry.path === "cubby/exports/markdown/export.md"));

    const query = await runCli(["artifacts", "--workspace", workspace, "--query", "draft"]);
    assert.match(query.stdout, /Matches: 1/);
    assert.match(query.stdout, /cubby\/outputs\/lesson-packs\/draft.md/);
  });
});

test("export copies markdown output and records state", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "cubby/outputs/lesson-packs/draft.md"), "# Draft\n", "utf8");

    const result = await runCli(["export", "--workspace", workspace, "--source", "cubby/outputs/lesson-packs/draft.md"]);

    assert.match(result.stdout, /Cubby export written/);
    assert.equal(await readFile(path.join(workspace, "cubby/exports/markdown/lesson-packs/draft.md"), "utf8"), "# Draft\n");

    const currentTask = YAML.parse(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"));
    assert.ok(currentTask.outputs.exports.some((entry) => entry.path === "cubby/exports/markdown/lesson-packs/draft.md"));

    const validate = await runCli(["validate", "--workspace", workspace]);
    assert.match(validate.stdout, /Cubby validation passed\./);
    assert.match(validate.stdout, /task state changed from initial scaffold/);
  });
});

test("export blocks when human review is required", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "cubby/outputs/parent-emails/draft.md"), "# Draft\n", "utf8");

    const currentTaskPath = path.join(workspace, "cubby/state/current-task.yaml");
    const currentTask = YAML.parse(await readFile(currentTaskPath, "utf8"));
    currentTask.validation.human_review_required.required = true;
    currentTask.validation.human_review_required.reason = "family communication";
    await writeFile(currentTaskPath, YAML.stringify(currentTask), "utf8");

    await assert.rejects(runCli(["export", "--workspace", workspace, "--source", "cubby/outputs/parent-emails/draft.md"]));

    const forced = await runCli(["export", "--workspace", workspace, "--source", "cubby/outputs/parent-emails/draft.md", "--force"]);
    assert.match(forced.stdout, /Review override: true/);
    assert.equal(await readFile(path.join(workspace, "cubby/exports/markdown/parent-emails/draft.md"), "utf8"), "# Draft\n");
  });
});

test("redact writes warning report without modifying source", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    const sourcePath = path.join(workspace, "cubby/outputs/parent-emails/draft.md");
    await writeFile(sourcePath, "Email: family@example.com\nStudent Name: Jordan\n", "utf8");

    const result = await runCli(["redact", "--workspace", workspace, "--source", "cubby/outputs/parent-emails/draft.md"]);

    assert.match(result.stdout, /Cubby redaction scan completed with warnings/);
    assert.match(result.stdout, /Findings: 2/);
    assert.equal(await readFile(sourcePath, "utf8"), "Email: family@example.com\nStudent Name: Jordan\n");

    const reports = await readdir(path.join(workspace, "cubby/logs/redactions"));
    const report = YAML.parse(await readFile(path.join(workspace, "cubby/logs/redactions", reports[0]), "utf8"));
    assert.equal(report.status, "warn");
    assert.equal(report.finding_count, 2);
  });
});

test("scaffold creates workflow and agent starters without overwriting", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cubby-scaffold-"));
  try {
    await mkdir(path.join(root, "src/workflows"), { recursive: true });
    await mkdir(path.join(root, "src/agents"), { recursive: true });
    await mkdir(path.join(root, "src/packs"), { recursive: true });

    const workflow = await runCli(["scaffold", "workflow", "weekly-plan", "--root", root]);
    const agent = await runCli(["scaffold", "agent", "math-specialist", "--root", root]);
    const pack = await runCli([
      "scaffold",
      "pack",
      "operations-pack",
      "--need",
      "Teachers need a coordinated daily operations pack for recurring classroom routines.",
      "--root",
      root
    ]);

    assert.match(workflow.stdout, /src\/workflows\/weekly-plan.yaml/);
    assert.match(agent.stdout, /src\/agents\/math-specialist.md/);
    assert.match(pack.stdout, /src\/packs\/operations-pack.yaml/);
    assert.match(await readFile(path.join(root, "src/workflows/weekly-plan.yaml"), "utf8"), /id: weekly-plan/);
    assert.match(await readFile(path.join(root, "src/agents/math-specialist.md"), "utf8"), /# Math Specialist/);
    assert.match(await readFile(path.join(root, "src/packs/operations-pack.yaml"), "utf8"), /id: operations-pack/);
    assert.match(await readFile(path.join(root, "src/packs/operations-pack.yaml"), "utf8"), /unmet_use_case: Teachers need a coordinated daily operations pack/);
    assert.match(await readFile(path.join(root, "src/packs/operations-pack.yaml"), "utf8"), /quality_checks:/);

    await assert.rejects(runCli(["scaffold", "workflow", "weekly-plan", "--root", root]));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("sample outputs include lesson and parent email examples", async () => {
  assert.match(await readFile(path.resolve("examples/sample-outputs/lesson-pack/main-idea-grade-2/lesson-plan.md"), "utf8"), /Main Idea Lesson Plan/);
  assert.match(await readFile(path.resolve("examples/sample-outputs/lesson-pack/main-idea-grade-2/validation-summary.md"), "utf8"), /Validation Summary/);
  assert.match(await readFile(path.resolve("examples/sample-outputs/parent-emails/conference-prep/email-draft.md"), "utf8"), /Conference Prep Email Draft/);
  assert.match(await readFile(path.resolve("examples/sample-outputs/parent-emails/conference-prep/review-checklist.md"), "utf8"), /Review Checklist/);
});

async function withWorkspace(callback) {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "cubby-test-"));
  try {
    await callback(path.join(tempRoot, "workspace"));
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
}

async function runCli(args) {
  return execFileAsync(process.execPath, [cliPath, ...args], {
    cwd: path.resolve(".")
  });
}
