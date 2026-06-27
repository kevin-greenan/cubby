# Subagent Task Packet

Use this packet shape when routing work to a specialist subagent.

```yaml
id: subagent-call-id
agent: lesson-architect
purpose: Draft the lesson sequence for the requested objective.
workflow: lesson-plan
phase: draft
inputs:
  task_context: cubby/state/current-task.yaml
  local_context:
    - cubby/local/teacher-preferences.yaml
    - cubby/local/classroom-context.yaml
  source_materials: []
boundaries:
  - Do not add student-identifying information.
  - Do not finalize sensitive recommendations.
expected_output:
  format: markdown
  include:
    - findings
    - assumptions
    - draft_content
    - risks_or_review_notes
review_gate:
  required: false
  reason: ""
```

Record the packet summary and result in `cubby/state/current-task.yaml`. Store longer subagent output under `cubby/logs/decisions/` or the relevant task output folder when it should be preserved.
