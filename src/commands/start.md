# /start

Purpose: Initialize `cubby/state/current-task.yaml` from an installed workflow so Codex has a concrete task packet to continue.

Inputs:

* workflow: installed workflow id, such as `lesson-plan` or `parent-email`
* title: optional task title
* grade: optional grade context
* subject: optional subject context
* topic: optional topic context
* duration: optional duration in minutes
* force: replace an active task only when the user explicitly chooses to do so

Workflow:

1. Read `cubby/framework/workflows/<workflow>.yaml`.
2. Refuse to replace an active task unless `--force` is provided.
3. Set task id, title, workflow, status, first phase, risk level, and context.
4. Seed planned draft outputs from workflow output templates.
5. Seed subagent strategy, requested fanout agents, and pending subagent calls.
6. Seed validation and human-review gate state from workflow gates.
7. Write the next instruction for Codex into `next_action.message`.

Gates:

* Starting a workflow does not generate teacher-facing artifacts.
* Sensitive workflows may start with human review already required.
* The orchestrator still owns synthesis and must update task state as phases complete.

Example usage:

```text
cubby start lesson-plan --workspace ./my-classroom-workspace --title "Main idea lesson" --grade 2 --subject ELA --topic "main idea" --duration 45
cubby start parent-email --workspace ./my-classroom-workspace --title "Conference follow-up" --force
```
