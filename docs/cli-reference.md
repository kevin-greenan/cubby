# CLI Reference

This reference summarizes the current Cubby CLI surface for repository developers and agents implementing toward v1.

Run commands through the built CLI:

```text
node dist/cli/index.js <command> [options]
```

After package installation, the `cubby` bin can use the same arguments.

## Workspace Commands

### init

Create or update a Cubby workspace.

```text
cubby init --profile <name> --adapter <name> --workspace <path>
```

Defaults:

* `--profile k5-special-ed`
* `--adapter codex`
* `--workspace .`

Use this before any workflow command. Repeat runs preserve local context, outputs, exports, logs, custom templates, and locally edited managed files.

### validate

Validate workspace structure, managed-file state, framework definitions, pack references, current task state, artifact records, and artifact content.

```text
cubby validate --workspace <path>
```

Validation fails on broken required files, malformed state, unresolved active workflows, invalid workflow phases, broken pack references, and active packs that do not meet quality gates. Validation warns on local managed-file edits, sensitive-pattern findings, missing non-planned output files, placeholder-heavy artifacts, weak Markdown headings, weak CSV headers, and missing export/source files.

### status

Print the current task, review state, output counts, subagent state, and managed-file count.

```text
cubby status --workspace <path>
```

### manifest

Summarize managed files, missing files, local edits, adapter, profile, version, and preserved local paths.

```text
cubby manifest --workspace <path>
```

### upgrade

Preview managed-file upgrade outcomes.

```text
cubby upgrade --workspace <path> --dry-run
```

Only dry-run upgrade behavior is implemented in the current local release.

## Workflow Commands

### start

Start a workflow and seed current task state from the installed workflow definition.

```text
cubby start <workflow> --workspace <path> [--title <title>] [--grade <grade>] [--subject <subject>] [--topic <topic>] [--duration <minutes>] [--force]
```

`start` records planned output paths, human-review requirements, subagent strategy, initial fanout calls, and the next action. Use `--force` only when replacing an active task is intentional.

### advance

Move the active task to the next workflow phase or an explicit phase.

```text
cubby advance --workspace <path> [--phase <phase>] [--status <status>] [--note <note>] [--complete-subagents]
```

Statuses may be `in_progress`, `blocked`, `waiting_for_review`, or `complete`. `--complete-subagents` marks currently requested fanout subagents complete before advancing.

### resume

Print continuation context for the active task.

```text
cubby resume --workspace <path>
```

Use this when Codex or another agent needs to reload the next action without inspecting state manually.

### handoff

Write a handoff note under `cubby/logs/handoffs/`.

```text
cubby handoff --workspace <path>
```

Use handoffs when a teacher or later agent needs assumptions, output state, review status, and next steps.

### complete

Mark the active task complete and optionally record human review.

```text
cubby complete --workspace <path> [--reviewed] [--note <note>]
```

If the task still has an active human-review gate, `complete` requires `--reviewed`. When review is recorded, Cubby clears the export gate, appends a reviewed decision note, and sets `next_action.mode` to `complete`.

## Artifact Commands

### artifacts

Index outputs and exports, then optionally print matches for a query.

```text
cubby artifacts --workspace <path> [--query <term>]
```

The index is written to `cubby/logs/artifacts/index.yaml`.

### export

Copy a Markdown draft from `cubby/outputs/` into `cubby/exports/markdown/`.

```text
cubby export --workspace <path> --source <cubby/outputs/file.md> [--force] [--overwrite]
```

Use `--force` only after required human review has happened but has not been recorded through `complete --reviewed`. Use `--overwrite` when replacing an existing export is intentional.

### redact

Scan a source artifact for sensitive patterns and write a report under `cubby/logs/redactions/`.

```text
cubby redact --workspace <path> --source <path>
```

Redaction scans do not modify the source file.

## Library Commands

### packs

List installed workflow packs with scope, need, workflows, commands, agents, validators, hooks, tools, and quality checks.

```text
cubby packs --workspace <path>
```

### scaffold

Create starter source files for framework extension work.

```text
cubby scaffold workflow <name> [--root <repo-path>]
cubby scaffold agent <name> [--root <repo-path>]
cubby scaffold pack <name> [--need <unmet-use-case>] [--root <repo-path>]
```

Scaffold commands do not overwrite existing files. Pack scaffolding requires a concrete unmet use case so generated packs stay scoped and reviewable.

## Common Flow

```text
cubby init --profile k5-special-ed --adapter codex --workspace ./workspace
cubby start lesson-plan --workspace ./workspace --title "Main idea lesson" --grade 2 --subject ELA --topic "main idea" --duration 45
cubby advance --workspace ./workspace --complete-subagents
cubby validate --workspace ./workspace
cubby handoff --workspace ./workspace
cubby export --workspace ./workspace --source cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md
cubby complete --workspace ./workspace --note "Teacher reviewed the lesson draft."
cubby artifacts --workspace ./workspace --query main-idea
cubby manifest --workspace ./workspace
```

For review-gated workflows, complete human review before export or final use:

```text
cubby complete --workspace ./workspace --reviewed --note "Teacher reviewed family communication for privacy and tone."
cubby export --workspace ./workspace --source cubby/outputs/parent-emails/conference-follow-up/email-draft.md
```
