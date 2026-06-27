import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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
    assert.match(await readFile(path.join(workspace, "cubby/state/current-task.yaml"), "utf8"), /status: not_started/);

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

test("validate fails when current task is malformed", async () => {
  await withWorkspace(async (workspace) => {
    await runCli(["init", "--profile", "k5-special-ed", "--adapter", "codex", "--workspace", workspace]);
    await writeFile(path.join(workspace, "cubby/state/current-task.yaml"), "task:\n  status: nope\n", "utf8");

    await assert.rejects(runCli(["validate", "--workspace", workspace]));
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
