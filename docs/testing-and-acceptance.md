# Testing and Acceptance

This document defines practical checks for MVP readiness.

## Minimum Commands

The baseline repository quality check is:

```text
python scripts/quality_check.py
```

It runs without third-party dependencies and is also executed in GitHub Actions.

The MVP acceptance path is:

```text
npm install
npm run quality
npm run check
npm run build
npm test
node dist/cli/index.js init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js validate --workspace ./examples/k5-special-ed-workspace
```

If a script is not implemented yet, report that plainly and add it before claiming MVP readiness.

## Core Test Areas

Add tests for:

* required project docs and local Markdown links
* CLI argument parsing
* workspace initialization
* source folders for hooks, extensions, tools, skills, validators, and adapters
* managed-file header insertion
* manifest creation
* current task schema validation
* repeat init safety
* local customization preservation
* output/export/log preservation
* malformed workspace validation failures
* upgrade dry-run behavior when implemented

## Required Behavioral Tests

The test suite should cover:

1. `init` creates expected directories.
2. `init` creates generated workspace `AGENTS.md`.
3. `init` creates `.cubby-version`.
4. `init` creates `cubby/config.yaml`.
5. `init` creates `cubby/manifest.yaml`.
6. `init` creates `cubby/state/current-task.yaml`.
7. `validate` passes on a fresh workspace.
8. `validate` fails on malformed `current-task.yaml`.
9. Repeat `init` does not overwrite `cubby/local/teacher-preferences.yaml`.
10. Repeat `init` does not modify files under `cubby/outputs/`, `cubby/exports/`, or `cubby/logs/`.
11. Modified managed files are preserved and reported as `preserved-local-edit`.
12. Manifest entries include path, source, managed version, hash algorithm, content hash, and local edit policy.

## Acceptance Standard

A change is not MVP-complete just because files exist. The install loop must be reproducible:

* build passes
* init succeeds
* validate succeeds
* repeat init is safe
* managed-file behavior is visible in CLI output
* user-owned paths are preserved

Prefer focused tests over broad snapshot tests. Snapshot tests are acceptable only when the generated output is intentionally stable and easy to review.
