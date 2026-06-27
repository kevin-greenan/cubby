# /upgrade

Purpose: Preview or apply managed framework updates while preserving user-owned files and local edits.

Current behavior:

* `--dry-run` only
* reports created, skipped, updated, preserved-local-edit, and failed outcomes
* never modifies files during dry run

Example usage:

```text
cubby upgrade --workspace ./examples/k5-special-ed-workspace --dry-run
```
