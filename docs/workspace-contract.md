# Installed Workspace Contract

This contract describes the workspace created by `cubby init`.

## Repository vs Installed Workspace

The repository contains Cubby source files and CLI code. An installed workspace is generated for an educator or education-support user.

The repository root does not ship a development-only `AGENTS.md` in release-ready branches.

Installed workspaces should receive a generated `AGENTS.md` rendered from:

```text
src/adapters/codex/AGENTS.md.template
```

## Required Workspace Files

A valid local-release workspace should contain:

```text
AGENTS.md
.cubby-version
cubby/config.yaml
cubby/framework/
cubby/manifest.yaml
cubby/state/current-task.yaml
```

It should also contain the expected `cubby/local/`, `cubby/templates/custom/`, `cubby/outputs/`, `cubby/exports/`, and `cubby/logs/` directories.

## Ownership Rules

Treat these paths as user-owned:

```text
cubby/local/
cubby/templates/custom/
cubby/outputs/
cubby/exports/
cubby/logs/
```

`init`, repeat `init`, and `upgrade --dry-run` must not modify files under those paths.

Generated managed files may be updated only according to the manifest rules in [manifest-and-managed-files.md](manifest-and-managed-files.md).

## Usable Workspace Definition

A workspace is usable when:

* Generated `AGENTS.md` tells Codex what Cubby is and where state, commands, outputs, and validation rules live.
* `cubby/framework/` contains the managed framework library copied from provider-neutral source.
* `cubby/framework/subagents/` describes the provider-neutral spawn, fan-out, and fan-in protocol.
* `cubby/state/current-task.yaml` exists and validates.
* `cubby/config.yaml` records profile, adapter, autonomy mode, output conventions, and review-gate defaults.
* `cubby/manifest.yaml` records every managed file.
* `cubby validate --workspace <path>` reports pass/warn/fail for required structure and current task validity.
* Repeat init reports managed-file outcomes using the shared status names.

## Framework Library

`cubby/framework/` is managed by Cubby. It gives installed workspaces a local copy of the shared framework library:

```text
cubby/framework/adapters/
cubby/framework/agents/
cubby/framework/commands/
cubby/framework/extensions/
cubby/framework/hooks/
cubby/framework/packs/
cubby/framework/profiles/
cubby/framework/rules/
cubby/framework/schemas/
cubby/framework/skills/
cubby/framework/subagents/
cubby/framework/templates/
cubby/framework/tools/
cubby/framework/validators/
cubby/framework/workflows/
```

These files should be tracked in `cubby/manifest.yaml`. If a teacher or local agent edits one, repeat init should preserve it and report `preserved-local-edit`.

## Current Task State

The default current task should be a neutral not-started task. It should not include real student data.

Supported task statuses:

```text
not_started
in_progress
blocked
waiting_for_review
complete
```

Supported risk levels:

```text
low
medium
high
```

Sensitive workflows must be review-gated before handoff or export.

The current task state must also include `subagents.strategy`, `subagents.fanout`, and `subagents.calls` so orchestration can be resumed, audited, and handed off.

`cubby/state/current-task.yaml` is scaffolded by Cubby but intentionally mutable during normal work. Validation should check that it remains schema-valid without treating task progress as a managed-file drift warning.
