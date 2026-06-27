# /sub-plan

Purpose: Create a full-day or partial-day substitute plan.

Inputs:

* date
* grade
* schedule
* routines
* materials
* activities
* emergency procedures
* student-neutral support notes

Workflow:

1. Intake: gather schedule, routines, materials, and activities.
2. Draft: use Sub Plan Specialist and Materials Designer.
3. Review: check clarity, student-neutral supports, privacy, and operational risk.
4. Validate: run accessibility, privacy, and admin-lens checks when relevant.
5. Handoff: summarize materials, routines, fallback activities, and review notes.

Agents involved:

* classroom-orchestrator
* sub-plan-specialist
* materials-designer
* privacy-safeguards-reviewer
* accessibility-language-reviewer
* admin-lens-reviewer

Subagent pattern:

* Orchestrator fans out to Sub Plan Specialist, Materials Designer, and Behavior Support Specialist for independent plan sections.
* Privacy Reviewer checks that supports are student-neutral before validation.
* Admin Lens reviews operational risk when the plan includes logistics or emergency procedures.

Gates:

* Avoid sensitive student details.
* Include student-neutral supports only.
* Human review required if the plan contains sensitive student information.

Outputs:

* schedule
* activities
* materials list
* routines
* fallback activities
* handoff

State updates:

* task.workflow: sub-plan
* task.risk_level: low or medium
* subagents.strategy: fanout_fanin
* validation: privacy and accessibility

Example usage:

```text
/sub-plan date=2026-09-14 type=full-day
```
