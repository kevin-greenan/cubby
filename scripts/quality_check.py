#!/usr/bin/env python3
"""Repository quality checks for Cubby.

These checks intentionally use only the Python standard library so they can run
before the TypeScript project exists. Keep them small, explicit, and easy to
extend as the repo grows.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    ".github/workflows/quality.yml",
    ".gitignore",
    "AGENTS.md",
    "LICENSE",
    "README.md",
    "PLAN.md",
    "package-lock.json",
    "package.json",
    "tsconfig.json",
    "docs/README.md",
    "docs/workspace-contract.md",
    "docs/manifest-and-managed-files.md",
    "docs/adapter-contract.md",
    "docs/performance-library.md",
    "docs/cli-reference.md",
    "docs/testing-and-acceptance.md",
    "docs/walkthrough-lifecycle.md",
    "docs/walkthrough-lesson-pack.md",
    "docs/walkthrough-parent-email.md",
    "scripts/quality_check.py",
    "src/extensions/README.md",
    "src/tools/README.md",
    "src/skills/README.md",
    "src/subagents/README.md",
]

STATUS_NAMES = [
    "created",
    "skipped",
    "updated",
    "preserved-local-edit",
    "failed",
]

USER_OWNED_PATHS = [
    "cubby/local/",
    "cubby/templates/custom/",
    "cubby/outputs/",
    "cubby/exports/",
    "cubby/logs/",
]

MARKDOWN_LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def markdown_files() -> list[Path]:
    return sorted(
        path
        for path in ROOT.rglob("*.md")
        if ".git" not in path.parts and "node_modules" not in path.parts
        and not any(part.endswith("-workspace") for part in path.parts)
    )


def check_required_files(errors: list[str]) -> None:
    for item in REQUIRED_FILES:
        if not (ROOT / item).is_file():
            errors.append(f"missing required file: {item}")


def check_whitespace(errors: list[str]) -> None:
    for path in markdown_files():
        text = path.read_text(encoding="utf-8")
        if not text.endswith("\n"):
            errors.append(f"{rel(path)}: file must end with newline")
        for number, line in enumerate(text.splitlines(), start=1):
            if line.rstrip(" \t") != line:
                errors.append(f"{rel(path)}:{number}: trailing whitespace")


def check_local_links(errors: list[str]) -> None:
    for path in markdown_files():
        text = path.read_text(encoding="utf-8")
        for match in MARKDOWN_LINK_RE.finditer(text):
            target = match.group(1).strip()
            if (
                not target
                or target.startswith("#")
                or "://" in target
                or target.startswith("mailto:")
            ):
                continue
            target_path = target.split("#", 1)[0]
            if not target_path:
                continue
            candidate = (path.parent / target_path).resolve()
            try:
                candidate.relative_to(ROOT)
            except ValueError:
                errors.append(f"{rel(path)}: link escapes repo: {target}")
                continue
            if not candidate.exists():
                errors.append(f"{rel(path)}: broken local link: {target}")


def check_agents_scope(errors: list[str]) -> None:
    text = read("AGENTS.md")
    required = [
        "Repository Development Agent Guide",
        "repository development only",
        "not part of Cubby's generated teacher-workspace outputs",
        "It remains named `AGENTS.md`",
    ]
    for phrase in required:
        if phrase not in text:
            errors.append(f"AGENTS.md must clarify repo-only scope: missing {phrase!r}")


def check_plan_contracts(errors: list[str]) -> None:
    plan = read("PLAN.md")
    for status in STATUS_NAMES:
        if status not in plan:
            errors.append(f"PLAN.md missing managed-file status name: {status}")
    for path in USER_OWNED_PATHS:
        if path not in plan:
            errors.append(f"PLAN.md missing user-owned preservation path: {path}")
    if "Root AGENTS.md is a repository-development guide" not in plan:
        errors.append("PLAN.md must distinguish root AGENTS.md from generated workspace AGENTS.md")
    if "docs/" not in plan:
        errors.append("PLAN.md must mention implementation support docs")
    if "subagent" not in plan.lower():
        errors.append("PLAN.md must make subagent orchestration explicit")


def check_docs_index(errors: list[str]) -> None:
    index = read("docs/README.md")
    for item in REQUIRED_FILES:
        if not item.startswith("docs/") or item == "docs/README.md":
            continue
        name = item.removeprefix("docs/")
        if name not in index:
            errors.append(f"docs/README.md must link or mention {name}")


def main() -> int:
    errors: list[str] = []
    check_required_files(errors)
    check_whitespace(errors)
    check_local_links(errors)
    check_agents_scope(errors)
    check_plan_contracts(errors)
    check_docs_index(errors)

    if errors:
        print("Quality checks failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Quality checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
