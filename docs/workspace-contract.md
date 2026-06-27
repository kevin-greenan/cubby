# Installed Workspace Contract

This contract describes the workspace created by `cubby init`.

## Repository vs Installed Workspace

The repository contains Cubby source files and CLI code. An installed workspace is generated for an educator or education-support user.

The repository root `AGENTS.md` is for developing Cubby. It must not be copied into installed workspaces.

Installed workspaces should receive a generated `AGENTS.md` rendered from:

```text
src/adapters/codex/AGENTS.md.template
```

## Required Workspace Files

A valid MVP workspace should contain:

```text
AGENTS.md
.cubby-version
cubby/config.yaml
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
* `cubby/state/current-task.yaml` exists and validates.
* `cubby/config.yaml` records profile, adapter, autonomy mode, output conventions, and review-gate defaults.
* `cubby/manifest.yaml` records every managed file.
* `cubby validate --workspace <path>` reports pass/warn/fail for required structure and current task validity.
* Repeat init reports managed-file outcomes using the shared status names.

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
