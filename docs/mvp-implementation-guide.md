# MVP Implementation Guide

This guide turns the plan into an implementation sequence for Milestones 1 and 2.

## Goal

The MVP is not a complete education workflow system. The first useful product is a repeat-safe CLI that can install a Codex-ready Cubby workspace and validate the result.

MVP success means:

* The repository builds as a TypeScript CLI project.
* `cubby init` creates a usable installed workspace.
* `cubby validate` reports workspace health.
* Repeat init is safe and inspectable.
* Generated files are tracked in `cubby/manifest.yaml`.
* The managed framework library is installed under `cubby/framework/`.
* Subagent orchestration guidance is installed under `cubby/framework/subagents/`.
* Local customization, outputs, exports, and logs are never overwritten.
* The source tree leaves clear, provider-neutral places for subagents, hooks, extensions, tools, skills, validators, and future library packs.

## Recommended Build Order

1. Create the TypeScript project shell.
2. Add CLI argument parsing for `init` and `validate`.
3. Add static source content needed for the Codex adapter.
4. Add source folders and representative starter files for agents, subagents, workflows, commands, rules, templates, validators, hooks, extensions, tools, skills, profiles, and adapters.
5. Install the managed framework library into `cubby/framework/`.
6. Implement deterministic directory creation.
7. Implement managed-file writing with headers.
8. Implement manifest creation with hashes.
9. Implement repeat-init handling for unchanged, changed, and missing managed files.
10. Implement workspace validation.
11. Add tests for init, validate, manifest, and preservation behavior.
12. Add README quickstart after the commands actually work.

## Keep Scope Narrow

Do not implement these in the first MVP pass:

* Google Workspace, Microsoft 365, LMS, or SIS integrations
* DOCX, XLSX, or PPTX generation
* Background automation
* Authentication
* Databases
* Web UI
* Full autonomous continuation

Scaffold future concepts only when they support the first install/validate loop.

Do create clear source locations for Cubby's performance library. Subagents, hooks, extensions, tools, and skills are first-class framework concepts, even when their first MVP representation is declarative or documented rather than fully executable.

## First Useful CLI

The first CLI should support:

```text
cubby init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace
cubby validate --workspace ./examples/k5-special-ed-workspace
cubby start lesson-plan --workspace ./examples/k5-special-ed-workspace --title "Main idea lesson"
cubby status --workspace ./examples/k5-special-ed-workspace
cubby resume --workspace ./examples/k5-special-ed-workspace
cubby handoff --workspace ./examples/k5-special-ed-workspace
cubby manifest --workspace ./examples/k5-special-ed-workspace
cubby upgrade --workspace ./examples/k5-special-ed-workspace --dry-run
```

Useful output should report:

* created files
* skipped files
* updated managed files
* preserved local edits
* failed writes or validation failures

Use these status labels exactly where practical:

```text
created
skipped
updated
preserved-local-edit
failed
```

## Implementation Notes

Prefer simple filesystem code over abstractions that are hard to inspect. Keep generated content deterministic so tests can compare file presence, manifests, and selected content.

Use `PLAN.md` as the source of truth when deciding which files to create. If a planned file is only a future placeholder, prefer a short meaningful stub over an empty file.
