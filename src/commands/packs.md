# /packs

Purpose: List installed Cubby workflow packs.

Inputs:

* workspace

Workflow:

1. Read pack definitions under `cubby/framework/packs/`.
2. Print each pack's status, workflows, commands, and review-gate notes.
3. Use packs to choose the right workflow family before opening command and workflow files.

Gates:

* Pack listings are routing guidance only.
* Review gates from the selected workflow and pack still apply.

Example usage:

```text
cubby packs --workspace ./my-classroom-workspace
```
