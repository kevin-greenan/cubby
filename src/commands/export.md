# /export

Purpose: Export a reviewed Markdown draft from `cubby/outputs/` to `cubby/exports/markdown/`.

Inputs:

* source path under `cubby/outputs/`
* optional `--force` after required human review is complete
* optional `--overwrite` when replacing an existing export

Workflow:

1. Confirm the source file is a Markdown file under `cubby/outputs/`.
2. Read `cubby/state/current-task.yaml`.
3. Stop if human review is required and `--force` is not present.
4. Copy the source to the matching path under `cubby/exports/markdown/`.
5. Append an export record to `outputs.exports` in the current task state.

Gates:

* This command currently exports Markdown only.
* Use `--force` only after the teacher or qualified professional completes the required review.
* Do not export parent communication, IEP-adjacent content, behavior-support recommendations, progress interpretation, or student-specific accommodation recommendations without review.

Example usage:

```text
cubby export --workspace ./my-classroom-workspace --source cubby/outputs/lesson-packs/main-idea/lesson-plan.md
```
