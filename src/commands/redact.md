# /redact

Purpose: Scan a local artifact for obvious sensitive-information patterns before sharing or export.

Inputs:

* source path inside the workspace

Workflow:

1. Read the source artifact.
2. Scan for deterministic warning patterns such as email addresses, phone numbers, SSNs, date-of-birth labels, address labels, and student-name labels.
3. Write a report under `cubby/logs/redactions/`.
4. Treat findings as review prompts, not automatic edits.

Gates:

* The scan does not prove an artifact is safe.
* The command never rewrites the source file.
* Sensitive workflows still require human review.

Example usage:

```text
cubby redact --workspace ./my-classroom-workspace --source cubby/outputs/parent-emails/draft.md
```
