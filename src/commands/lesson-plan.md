# /lesson-plan

Purpose: Create a single K-5 lesson plan draft.

Inputs:

* grade
* subject
* topic
* objective
* duration
* materials
* standard, optional
* student needs, optional
* output format

Workflow:

1. Intake: confirm grade, subject, topic, objective, timing, and materials.
2. Context: load relevant local preferences, classroom context, standards, and custom templates.
3. Draft: use the Lesson Architect and Materials Designer.
4. Review: use Curriculum Alignment, Differentiation, Accessibility, and Privacy reviewers when relevant.
5. Validate: run alignment, accessibility, and privacy checks.
6. Handoff: summarize assumptions, outputs, review needs, and next steps.

Agents involved:

* classroom-orchestrator
* lesson-architect
* curriculum-alignment-specialist
* differentiation-specialist
* materials-designer
* accessibility-language-reviewer
* privacy-safeguards-reviewer

Subagent pattern:

* Orchestrator fans out to Lesson Architect, Curriculum Alignment, and Differentiation during draft.
* Materials Designer and Privacy Reviewer review the synthesized draft before validation.
* Record subagent calls and fan-in notes in `subagents.calls`.

Gates:

* Low-risk generic lessons may proceed autonomously in guided or managed mode.
* Accommodation-aware lessons require validation and may require human review.
* Student-specific recommendations require human review.

Outputs:

* lesson plan markdown
* optional handout
* validation summary
* handoff

State updates:

* task.workflow: lesson-plan
* task.risk_level: low or medium
* outputs.drafts: generated artifacts
* validation: privacy, alignment, accessibility
* subagents.strategy: fanout_fanin

Example usage:

```text
/lesson-plan grade=2 subject=ELA topic=main idea duration=45
```
