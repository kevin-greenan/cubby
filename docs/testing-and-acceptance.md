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
node dist/cli/index.js status --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js resume --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js handoff --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js artifacts --workspace ./examples/k5-special-ed-workspace --query lesson
node dist/cli/index.js redact --workspace ./examples/k5-special-ed-workspace --source cubby/outputs/parent-emails/example/email-draft.md
node dist/cli/index.js export --workspace ./examples/k5-special-ed-workspace --source cubby/outputs/lesson-packs/example/lesson-plan.md
node dist/cli/index.js manifest --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js upgrade --workspace ./examples/k5-special-ed-workspace --dry-run
```

If a script is not implemented yet, report that plainly and add it before claiming MVP readiness.

## Core Test Areas

Add tests for:

* required project docs and local Markdown links
* CLI argument parsing
* workspace initialization
* source folders for subagents, hooks, extensions, tools, skills, validators, and adapters
* managed-file header insertion
* manifest creation
* current task schema validation
* subagent strategy and call-state validation
* repeat init safety
* local customization preservation
* output/export/log preservation
* malformed workspace validation failures
* status output
* resume output
* handoff log generation
* artifact index generation
* artifact search
* Markdown export gate behavior
* redaction scan reports
* scaffold command behavior
* sample output examples
* manifest inspection
* upgrade dry-run behavior

## Required Behavioral Tests

The test suite should cover:

1. `init` creates expected directories.
2. `init` creates generated workspace `AGENTS.md`.
3. `init` creates `.cubby-version`.
4. `init` creates `cubby/config.yaml`.
5. `init` creates `cubby/manifest.yaml`.
6. `init` creates `cubby/state/current-task.yaml`.
7. `init` creates managed framework library files under `cubby/framework/`.
8. `init` creates subagent protocol files under `cubby/framework/subagents/`.
9. `validate` passes on a fresh workspace.
10. `validate` fails on malformed `current-task.yaml`.
11. Repeat `init` does not overwrite `cubby/local/teacher-preferences.yaml`.
12. Repeat `init` does not modify files under `cubby/outputs/`, `cubby/exports/`, or `cubby/logs/`.
13. Modified managed files are preserved and reported as `preserved-local-edit`.
14. Modified managed framework library files are preserved and reported as `preserved-local-edit`.
15. Manifest entries include path, source, managed version, hash algorithm, content hash, and local edit policy.
16. `status` summarizes current task, review state, outputs, and managed-file count.
17. `resume` prints next workflow instruction from current task state.
18. `handoff` writes a handoff log under `cubby/logs/handoffs/`.
19. `artifacts` writes an index under `cubby/logs/artifacts/`.
20. `artifacts --query` prints matching artifact entries.
21. `redact` writes a warning report under `cubby/logs/redactions/`.
22. `export` copies reviewed Markdown outputs to `cubby/exports/markdown/`.
23. `export` blocks when human review is required unless `--force` is provided after review.
24. `scaffold workflow <name>` and `scaffold agent <name>` create starter source files without overwriting existing files.
25. `examples/sample-outputs/` contains fictional lesson-pack and parent-email artifacts.
26. `manifest` summarizes managed files, missing files, and local edits.
27. `upgrade --dry-run` reports managed-file outcomes without modifying files.

## Acceptance Standard

A change is not MVP-complete just because files exist. The install loop must be reproducible:

* build passes
* init succeeds
* validate succeeds
* repeat init is safe
* managed-file behavior is visible in CLI output
* user-owned paths are preserved

Prefer focused tests over broad snapshot tests. Snapshot tests are acceptable only when the generated output is intentionally stable and easy to review.
