import path from "node:path";
import YAML from "yaml";
import { CUBBY_VERSION, LOCAL_FILES, MANAGED_VERSION, SUPPORTED_ADAPTERS, SUPPORTED_PROFILES, USER_OWNED_DIRS, WORKSPACE_DIRS } from "./constants.js";
import { localFileContent, renderedAgents, renderedConfig, renderedCurrentTask, renderedVersion } from "./content.js";
import { ensureDir, exists, readText, sha256, workspacePath, writeText } from "./fs-utils.js";
import type { InitOptions, ManagedFileEntry, Manifest, OperationResult } from "./types.js";

interface ManagedSpec {
  path: string;
  source: string;
  content: string;
}

export async function runInit(options: InitOptions): Promise<number> {
  if (!SUPPORTED_ADAPTERS.includes(options.adapter as (typeof SUPPORTED_ADAPTERS)[number])) {
    throw new Error(`Unsupported adapter: ${options.adapter}`);
  }
  if (!SUPPORTED_PROFILES.includes(options.profile as (typeof SUPPORTED_PROFILES)[number])) {
    throw new Error(`Unsupported profile: ${options.profile}`);
  }

  const workspace = path.resolve(options.workspace);
  await ensureDir(workspace);

  const results: OperationResult[] = [];
  for (const dir of WORKSPACE_DIRS) {
    await ensureDir(workspacePath(workspace, dir));
  }

  for (const file of LOCAL_FILES) {
    const target = workspacePath(workspace, file);
    if (await exists(target)) {
      results.push({ status: "skipped", path: file, message: "local file already exists" });
      continue;
    }
    await writeText(target, localFileContent(file));
    results.push({ status: "created", path: file, message: "local file created" });
  }

  const previousManifest = await readManifest(workspace);
  const createdAt = previousManifest?.created_at ?? new Date().toISOString();
  const previousEntries = new Map(previousManifest?.managed_files.map((entry) => [entry.path, entry]) ?? []);

  const specs: ManagedSpec[] = [
    {
      path: "AGENTS.md",
      source: "src/adapters/codex/AGENTS.md.template",
      content: await renderedAgents(options.profile)
    },
    {
      path: ".cubby-version",
      source: "cli/init.ts:renderedVersion",
      content: renderedVersion()
    },
    {
      path: "cubby/config.yaml",
      source: "cli/init.ts:renderedConfig",
      content: renderedConfig(options.profile, options.adapter)
    },
    {
      path: "cubby/state/current-task.yaml",
      source: "cli/init.ts:renderedCurrentTask",
      content: renderedCurrentTask()
    }
  ];

  const managedFiles: ManagedFileEntry[] = [];
  for (const spec of specs) {
    const result = await writeManagedFile(workspace, spec, previousEntries.get(spec.path));
    results.push(result.result);
    managedFiles.push(result.entry);
  }

  const manifest: Manifest = {
    cubby_version: CUBBY_VERSION,
    adapter: {
      name: options.adapter,
      version: CUBBY_VERSION
    },
    profile: options.profile,
    created_at: createdAt,
    managed_files: managedFiles,
    local_preserved_paths: USER_OWNED_DIRS
  };

  await writeText(workspacePath(workspace, "cubby/manifest.yaml"), YAML.stringify(manifest));
  results.push({ status: previousManifest ? "updated" : "created", path: "cubby/manifest.yaml", message: "manifest written" });

  printResults("Cubby init complete.", workspace, results);
  return results.some((result) => result.status === "failed") ? 1 : 0;
}

async function writeManagedFile(
  workspace: string,
  spec: ManagedSpec,
  previousEntry: ManagedFileEntry | undefined
): Promise<{ result: OperationResult; entry: ManagedFileEntry }> {
  const target = workspacePath(workspace, spec.path);
  const newHash = sha256(spec.content);
  const entry: ManagedFileEntry = {
    path: spec.path,
    source: spec.source,
    managed_version: MANAGED_VERSION,
    hash_algorithm: "sha256",
    content_hash: newHash,
    local_edits_policy: "preserve"
  };

  const existing = await readText(target);
  if (existing === undefined) {
    await writeText(target, spec.content);
    return { entry, result: { status: "created", path: spec.path, message: "managed file created" } };
  }

  const existingHash = sha256(existing);
  if (!previousEntry) {
    return {
      entry: {
        ...entry,
        content_hash: existingHash
      },
      result: { status: "preserved-local-edit", path: spec.path, message: "existing file is not tracked in manifest" }
    };
  }

  if (existingHash !== previousEntry.content_hash) {
    return {
      entry: {
        ...entry,
        content_hash: existingHash
      },
      result: { status: "preserved-local-edit", path: spec.path, message: "local edits preserved" }
    };
  }

  if (existingHash === newHash) {
    return { entry, result: { status: "skipped", path: spec.path, message: "managed file unchanged" } };
  }

  await writeText(target, spec.content);
  return { entry, result: { status: "updated", path: spec.path, message: "managed file updated" } };
}

async function readManifest(workspace: string): Promise<Manifest | undefined> {
  const text = await readText(workspacePath(workspace, "cubby/manifest.yaml"));
  if (!text) {
    return undefined;
  }
  return YAML.parse(text) as Manifest;
}

function printResults(title: string, workspace: string, results: OperationResult[]): void {
  console.log(title);
  console.log(`Workspace: ${workspace}`);
  for (const result of results) {
    console.log(`${result.status}\t${result.path}\t${result.message}`);
  }
}
