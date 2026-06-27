# /complete

Purpose: Mark the active Cubby task complete and optionally record required human review.

Inputs:

* reviewed: confirms the required teacher or qualified-professional review has happened
* note: optional completion or review note to append to current task state

Workflow:

1. Read `cubby/state/current-task.yaml`.
2. Confirm an active task exists.
3. If a human-review gate is still active, require `--reviewed`.
4. Record a decision note.
5. Clear the human-review export gate when review is recorded.
6. Set task status and next action to `complete`.

Gates:

* Do not use `--reviewed` until the teacher or qualified professional has actually reviewed the output.
* Review-gated artifacts remain blocked from normal export until review is recorded.
* Keep the note concrete enough for a future agent or teacher to understand what was reviewed.

Example usage:

```text
cubby complete --workspace ./my-classroom-workspace
cubby complete --workspace ./my-classroom-workspace --reviewed --note "Teacher reviewed the family email draft for tone and student privacy."
```
