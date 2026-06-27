#!/usr/bin/env node
import { runInit } from "./init.js";
import { runValidate } from "./validate.js";

interface ParsedArgs {
  command: string | undefined;
  options: Record<string, string>;
}

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  switch (parsed.command) {
    case "init":
      return runInit({
        profile: parsed.options.profile ?? "k5-special-ed",
        adapter: parsed.options.adapter ?? "codex",
        workspace: parsed.options.workspace ?? "."
      });
    case "validate":
      return runValidate({
        workspace: parsed.options.workspace ?? "."
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
  const options: Record<string, string> = {};
  for (let index = 0; index < rest.length; index += 1) {
    const item = rest[index];
    if (!item.startsWith("--")) {
      continue;
    }
    const key = item.slice(2);
    const value = rest[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    options[key] = value;
    index += 1;
  }
  return { command, options };
}

function printHelp(): void {
  console.log(`Cubby CLI

Commands:
  init --profile <name> --adapter <name> --workspace <path>
  validate --workspace <path>
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
