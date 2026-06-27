# Parent Email Walkthrough

This walkthrough shows the intended local Codex workflow for family-facing email drafts.

## Start

Create or open a Cubby workspace:

```text
cubby init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace
```

Ask Codex to run the parent-email workflow with audience, purpose, teacher-provided facts, desired tone, required points, and anything to avoid.

## Draft

Codex should read:

* `cubby/state/current-task.yaml`
* `cubby/framework/commands/parent-email.md`
* `cubby/framework/workflows/parent-email.yaml`
* relevant local context under `cubby/local/`

The orchestrator should run privacy review before drafting, then use family communication and accessibility reviewers.

## Output

Draft artifacts should go under:

```text
cubby/outputs/parent-emails/<task-slug>/
```

Expected drafts include the email draft, review checklist, validation summary, and handoff.

## Validate, Redact, And Review

Run:

```text
cubby validate --workspace ./examples/k5-special-ed-workspace
cubby redact --workspace ./examples/k5-special-ed-workspace --source cubby/outputs/parent-emails/<task-slug>/email-draft.md
cubby artifacts --workspace ./examples/k5-special-ed-workspace --query parent-emails
```

Parent and family communication always requires human review before use. If an export is needed after review, use `cubby export --force` and keep the review context in the handoff.
