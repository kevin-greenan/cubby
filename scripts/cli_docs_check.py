#!/usr/bin/env python3
"""Check that CLI commands are represented in docs and command files."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLI_INDEX = ROOT / "cli/index.ts"
CLI_REFERENCE = ROOT / "docs/cli-reference.md"
COMMAND_DIR = ROOT / "src/commands"

IGNORED_COMMANDS = {"help"}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def commands_from_index() -> list[str]:
    text = read(CLI_INDEX)
    return sorted(set(re.findall(r'case "([a-z0-9-]+)":', text)) - IGNORED_COMMANDS)


def main() -> int:
    errors: list[str] = []
    commands = commands_from_index()
    reference = read(CLI_REFERENCE)

    for command in commands:
        if f"### {command}" not in reference:
            errors.append(f"docs/cli-reference.md missing section for command: {command}")
        command_file = COMMAND_DIR / f"{command}.md"
        if not command_file.is_file():
            errors.append(f"missing command doc: src/commands/{command}.md")

    documented = set(re.findall(r"^### ([a-z0-9-]+)$", reference, flags=re.MULTILINE))
    extra = sorted(documented - set(commands))
    for command in extra:
        errors.append(f"docs/cli-reference.md documents unknown command: {command}")

    if errors:
        print("CLI docs check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"CLI docs check passed: {len(commands)} commands documented.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
