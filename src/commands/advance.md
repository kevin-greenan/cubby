# /advance

Purpose: Move the active Cubby task to the next workflow phase and refresh phase-specific subagent state.

Inputs:

* phase: optional explicit target phase
* status: optional task status, one of `in_progress`, `blocked`, `waiting_for_review`, or `complete`
* note: optional decision note to append to current task state
* complete-subagents: mark currently requested subagents and pending calls complete before advancing

Workflow:

1. Read `cubby/state/current-task.yaml`.
2. Load the active workflow from `cubby/framework/workflows/`.
3. Select the next phase unless an explicit phase is provided.
4. Validate the phase belongs to the active workflow.
5. Optionally mark current fanout subagents complete.
6. Seed requested subagents and pending calls for the target phase.
7. Update `next_action.message` with the next concrete instruction.

Gates:

* Run `cubby start <workflow>` before advancing a task.
* Do not skip required human review. A `human_gate` phase pauses with `waiting_for_review`.
* Use notes to preserve important assumptions, decisions, or review outcomes.

Example usage:

```text
cubby advance --workspace ./my-classroom-workspace --complete-subagents
cubby advance --workspace ./my-classroom-workspace --phase review --note "Draft sections complete; moving to review."
```
