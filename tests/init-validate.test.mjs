import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
    assert.match(await readFile(path.join(workspace, "cubby/framework/workflows/lesson-plan.yaml"), "utf8"), /managed-by: cubby/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/skills/README.md"), "utf8"), /Skills/);
    assert.match(await readFile(path.join(workspace, "cubby/framework/subagents/README.md"), "utf8"), /Subagents/);

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
