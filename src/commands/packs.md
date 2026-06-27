# /packs

Purpose: List installed Cubby workflow packs.

Inputs:

* workspace

Workflow:

1. Read pack definitions under `cubby/framework/packs/`.
2. Print each pack's status, unmet use case, include/exclude scope, workflows, commands, quality checks, and review-gate notes.
3. Use packs to choose the right workflow family before opening command and workflow files.
4. If no pack fits, use `cubby/framework/tools/pack-design.md` before scaffolding a new pack.

Gates:

* Pack listings are routing guidance only.
* Review gates from the selected workflow and pack still apply.
* New active packs must pass scope and quality validation before they become routing guidance.

Example usage:

```text
cubby packs --workspace ./my-classroom-workspace
```
