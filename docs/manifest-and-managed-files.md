# Manifest and Managed Files

Cubby uses managed-file metadata to make init and future upgrade behavior safe.

## Managed Header

Generated managed Markdown files should include:

```markdown
<!--
managed-by: cubby
managed-version: 0.1.0
local-edits: discouraged
safe-customization: use cubby/local/ or cubby/templates/custom/
-->
```

Generated managed YAML files should include:

```yaml
# managed-by: cubby
# managed-version: 0.1.0
# local-edits: discouraged
# safe-customization: use cubby/local/ or cubby/templates/custom/
```

## Manifest Fields

`cubby/manifest.yaml` should record:

```yaml
cubby_version: 0.1.0
adapter:
  name: codex
  version: 0.1.0
profile: k5-special-ed
created_at: "ISO-8601 timestamp"
managed_files:
  - path: AGENTS.md
    source: src/adapters/codex/AGENTS.md.template
    managed_version: 0.1.0
    hash_algorithm: sha256
    content_hash: ""
    local_edits_policy: preserve
local_preserved_paths:
  - cubby/local/
  - cubby/templates/custom/
  - cubby/outputs/
  - cubby/exports/
  - cubby/logs/
```

Use `sha256` unless the plan changes. Hash the rendered file content as written to disk, including the managed header.

## Repeat Init Rules

On repeat init:

* If a managed file is missing, recreate it and report `created`.
* If a managed file exists and its hash matches the manifest, it may be left alone as `skipped` or replaced with newly rendered content as `updated`.
* If a managed file exists and its hash does not match the manifest, preserve it and report `preserved-local-edit`.
* If a write or validation step fails, report `failed`.
* Never overwrite user-owned paths.

## Status Names

Use these exact status names for init and upgrade reporting:

```text
created
skipped
updated
preserved-local-edit
failed
```

Tests should assert these values where practical.

## Upgrade MVP

For MVP, `upgrade` may be dry-run only. It should inspect manifest state and report what would happen without modifying files.
