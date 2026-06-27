# Lifecycle Walkthrough

This walkthrough shows a complete local Cubby loop for a teacher-facing lesson draft.

## Run The Demo

Build the CLI, then run the lifecycle script:

```text
npm run build
npm run demo:lifecycle
```

By default, the script writes an inspectable workspace to:

```text
${TMPDIR:-/tmp}/cubby-lifecycle-demo
```

Pass a workspace path to keep the demo somewhere else:

```text
npm run demo:lifecycle -- ./examples/lifecycle-demo-workspace
```

## What The Demo Exercises

The script runs the same loop an agent should use while implementing v1 workflows:

```text
cubby init
cubby start lesson-plan
write a draft under cubby/outputs/
cubby advance --complete-subagents
cubby validate
cubby advance --phase handoff
cubby handoff
cubby export
cubby artifacts
cubby manifest
```

The generated draft is intentionally simple and fictional. It exists to prove the workflow contract, not to model a finished lesson design.

## Inspect The Workspace

After the run, inspect:

* `AGENTS.md` for the generated adapter instructions.
* `cubby/state/current-task.yaml` for active task, phase, subagent, validation, and output state.
* `cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md` for the draft.
* `cubby/exports/markdown/lesson-packs/main-idea-lesson/lesson-plan.md` for the export.
* `cubby/logs/handoffs/` for the handoff note.
* `cubby/logs/artifacts/index.yaml` for the artifact index.
* `cubby/logs/validations/` for validation results.

## Teacher Workflow

For a real teacher workflow, Codex should:

1. Initialize or open the workspace.
2. Start the relevant workflow with grade, subject, topic, audience, duration, and constraints.
3. Read `cubby/state/current-task.yaml`, the command file, the workflow file, applicable packs, and local context.
4. Spawn or fan out to the recommended subagents for the current phase.
5. Draft artifacts only under `cubby/outputs/`.
6. Run validation and resolve warnings before treating an artifact as ready.
7. Use `handoff` when a teacher or another agent needs continuation context.
8. Export only reviewed artifacts that are safe for final use.

Review-gated workflows, especially family communication or student-specific support, must complete human review before export or final use.
