# /artifacts

Purpose: Build a local index of generated Cubby artifacts.

Inputs:

* workspace
* optional query term

Workflow:

1. Scan `cubby/outputs/` and `cubby/exports/`.
2. Include Markdown, YAML, CSV, and text artifacts.
3. Record path, area, format, byte size, modified timestamp, and content hash.
4. Include a short preview line for searchable text artifacts.
5. Write the index to `cubby/logs/artifacts/index.yaml`.
6. When `--query` is present, print matching artifact paths.

Gates:

* Artifact indexing does not approve or export sensitive material.
* Treat the index as local operational metadata.

Example usage:

```text
cubby artifacts --workspace ./my-classroom-workspace
cubby artifacts --workspace ./my-classroom-workspace --query lesson
```
