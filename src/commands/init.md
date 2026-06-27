# /init

Purpose: Create or update a local Cubby workspace for an educator or support professional.

Inputs:

* profile: Cubby profile to install, such as `k5-special-ed`
* adapter: adapter to render, currently `codex`
* workspace: target workspace path

Workflow:

1. Create required workspace directories.
2. Create local customization starter files when missing.
3. Render adapter-specific managed files.
4. Install the managed framework library under `cubby/framework/`.
5. Write `cubby/manifest.yaml` with managed-file hashes and preserved local paths.
6. Report created, skipped, updated, preserved-local-edit, or failed outcomes.

Gates:

* Never overwrite user-owned files under `cubby/local/`, `cubby/templates/custom/`, `cubby/outputs/`, `cubby/exports/`, or `cubby/logs/`.
* Preserve locally edited managed files on repeat init.
* Use the generated workspace `AGENTS.md` rendered from the Codex adapter template.

Example usage:

```text
cubby init --profile k5-special-ed --adapter codex --workspace ./my-classroom-workspace
```
