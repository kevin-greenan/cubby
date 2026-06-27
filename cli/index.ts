#!/usr/bin/env node
import { runAdvance } from "./advance.js";
import { runInit } from "./init.js";
import { runArtifacts } from "./artifacts.js";
import { runComplete } from "./complete.js";
import { runExport } from "./export.js";
import { runHandoff } from "./handoff.js";
import { runManifest } from "./manifest.js";
import { runPacks } from "./packs.js";
import { runRedact } from "./redact.js";
import { runResume } from "./resume.js";
import { runScaffold } from "./scaffold.js";
import { runStart } from "./start.js";
import { runStatus } from "./status.js";
import { runUpgrade } from "./upgrade.js";
import { runValidate } from "./validate.js";

interface ParsedArgs {
  command: string | undefined;
  args: string[];
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
    case "start":
      return runStart({
        workspace: stringOption(parsed.options.workspace, "."),
        workflow: parsed.args[0],
        title: stringOptionOrUndefined(parsed.options.title),
        grade: stringOptionOrUndefined(parsed.options.grade),
        subject: stringOptionOrUndefined(parsed.options.subject),
        topic: stringOptionOrUndefined(parsed.options.topic),
        duration: stringOptionOrUndefined(parsed.options.duration),
        force: parsed.options.force === true
      });
    case "advance":
      return runAdvance({
        workspace: stringOption(parsed.options.workspace, "."),
        phase: stringOptionOrUndefined(parsed.options.phase),
        status: stringOptionOrUndefined(parsed.options.status),
        note: stringOptionOrUndefined(parsed.options.note),
        completeSubagents: parsed.options["complete-subagents"] === true
      });
    case "complete":
      return runComplete({
        workspace: stringOption(parsed.options.workspace, "."),
        reviewed: parsed.options.reviewed === true,
        note: stringOptionOrUndefined(parsed.options.note)
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
        workspace: stringOption(parsed.options.workspace, "."),
        query: stringOptionOrUndefined(parsed.options.query)
      });
    case "redact":
      return runRedact({
        workspace: stringOption(parsed.options.workspace, "."),
        source: stringOptionOrUndefined(parsed.options.source)
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
    case "packs":
      return runPacks({
        workspace: stringOption(parsed.options.workspace, ".")
      });
    case "upgrade":
      return runUpgrade({
        workspace: stringOption(parsed.options.workspace, "."),
        dryRun: parsed.options["dry-run"] === true
      });
    case "scaffold":
      return runScaffold({
        kind: parsed.args[0],
        name: parsed.args[1],
        root: stringOption(parsed.options.root, "."),
        need: stringOptionOrUndefined(parsed.options.need)
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
  const args: string[] = [];
  const options: Record<string, string | boolean> = {};
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) {
      args.push(item);
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
  return { command, args, options };
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
  start <workflow> --workspace <path> [--title <title>] [--grade <grade>] [--subject <subject>] [--topic <topic>] [--duration <minutes>] [--force]
  advance --workspace <path> [--phase <phase>] [--status <status>] [--note <note>] [--complete-subagents]
  complete --workspace <path> [--reviewed] [--note <note>]
  resume --workspace <path>
  handoff --workspace <path>
  artifacts --workspace <path> [--query <term>]
  export --workspace <path> --source <cubby/outputs/file.md> [--force] [--overwrite]
  redact --workspace <path> --source <path>
  manifest --workspace <path>
  packs --workspace <path>
  upgrade --workspace <path> --dry-run
  scaffold workflow <name> [--root <repo-path>]
  scaffold agent <name> [--root <repo-path>]
  scaffold pack <name> [--need <unmet-use-case>] [--root <repo-path>]
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
