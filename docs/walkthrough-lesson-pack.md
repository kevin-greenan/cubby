# Lesson Pack Walkthrough

This walkthrough shows the intended local Codex workflow for a low-risk lesson pack.

## Start

Create or open a Cubby workspace:

```text
cubby init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace
```

Ask Codex to run the lesson-pack workflow with grade, subject, topic, objective, duration, and available materials.

## Draft

Codex should read:

* `cubby/state/current-task.yaml`
* `cubby/framework/commands/lesson-pack.md`
* `cubby/framework/workflows/lesson-pack.yaml`
* relevant local context under `cubby/local/`

The orchestrator should fan out to lesson, differentiation, materials, accessibility, and privacy specialists when useful.

## Output

Draft artifacts should go under:

```text
cubby/outputs/lesson-packs/<task-slug>/
```

Expected drafts include lesson plan, slides outline, student handout, exit ticket, differentiation matrix, validation summary, and handoff.

## Validate And Export

Run:

```text
cubby validate --workspace ./examples/k5-special-ed-workspace
cubby artifacts --workspace ./examples/k5-special-ed-workspace
cubby export --workspace ./examples/k5-special-ed-workspace --source cubby/outputs/lesson-packs/<task-slug>/lesson-plan.md
```

Generic lesson materials may export after validation when no human-review gate is active. Accommodation-aware or student-specific materials remain drafts until reviewed.
