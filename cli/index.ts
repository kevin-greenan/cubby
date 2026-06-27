#!/usr/bin/env node
import { runInit } from "./init.js";
import { runArtifacts } from "./artifacts.js";
import { runExport } from "./export.js";
import { runHandoff } from "./handoff.js";
import { runManifest } from "./manifest.js";
import { runResume } from "./resume.js";
import { runStatus } from "./status.js";
import { runUpgrade } from "./upgrade.js";
import { runValidate } from "./validate.js";

interface ParsedArgs {
  command: string | undefined;
  options: Record<string, string | boolean>;
}

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  switch (parsed.command) {
    case "init":
      return runInit({
        profile: stringOption(parsed.options.profile, "k5-special-ed"),
        adapter: stringOption(parsed.options.adapter, "codex"),
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "validate":
      return runValidate({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "status":
      return runStatus({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "resume":
      return runResume({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "handoff":
      return runHandoff({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "artifacts":
      return runArtifacts({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "export":
      return runExport({
        workspace: stringOption(parsed.options.workspace, "."),
        source: stringOptionOrUndefined(parsed.options.source),
        force: parsed.options.force === true,
        overwrite: parsed.options.overwrite === true
      });
    case "manifest":
      return runManifest({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "upgrade":
      return runUpgrade({
        workspace: stringOption(parsed.options.workspace, "."),
        dryRun: parsed.options["dry-run"] === true
      });
    case "help":
    case undefined:
      printHelp();
      return parsed.command ? 0 : 1;
    default:
      console.error(`Unknown command: ${parsed.command}`);
      printHelp();
      return 1;
  }
}

function parseArgs(argv: string[]): ParsedArgs {
  const [command, ...rest] = argv;
  const options: Record<string, string | boolean> = {};
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) {
      continue;
    }
    const key = item.slice(2);
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = value;
    index += 1;
  }
  return { command, options };
}

function stringOption(value: string | boolean | undefined, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function stringOptionOrUndefined(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function printHelp(): void {
  console.log(`Cubby CLI

Commands:
  init --profile <name> --adapter <name> --workspace <path>
  validate --workspace <path>
  status --workspace <path>
  resume --workspace <path>
  handoff --workspace <path>
  artifacts --workspace <path>
  export --workspace <path> --source <cubby/outputs/file.md> [--force] [--overwrite]
  manifest --workspace <path>
  upgrade --workspace <path> --dry-run
`);
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: Error) => {
    console.error(`failed\t${error.message}`);
    process.exitCode = 1;
  });
