# /parent-email

Purpose: Draft a family-facing email for teacher review.

Inputs:

* audience
* purpose
* context
* tone
* must include
* must avoid

Workflow:

1. Intake: clarify audience, purpose, facts, tone, and desired call to action.
2. Safety: identify sensitive details and avoid unnecessary disclosure.
3. Draft: use Family Communication Specialist.
4. Review: use Privacy Reviewer, Accessibility and Language Reviewer, and Admin Lens when relevant.
5. Validate: run family communication and privacy checks.
6. Human gate: pause before final use or sending.
7. Handoff: summarize review requirements and assumptions.

Agents involved:

* classroom-orchestrator
* family-communication-specialist
* privacy-safeguards-reviewer
* accessibility-language-reviewer
* admin-lens-reviewer

Subagent pattern:

* Orchestrator runs Privacy Reviewer before drafting.
* Family Communication Specialist drafts from teacher-provided facts only.
* Accessibility and Admin Lens reviewers check tone, clarity, and escalation risk when relevant.

Gates:

* Always requires human review.
* Concern, discipline-adjacent, behavior-adjacent, or progress-related messages are high risk.

Outputs:

* email draft
* review checklist
* privacy and tone validation
* handoff

State updates:

* task.workflow: parent-email
* task.risk_level: medium or high
* subagents.strategy: sequential
* validation.human_review_required.required: true

Example usage:

```text
/parent-email purpose=conference-prep tone=warm
```
