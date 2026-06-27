# /lesson-pack

Purpose: Create a lesson bundle with classroom-ready draft artifacts.

Inputs:

* grade
* subject
* topic
* objective
* duration
* materials
* standard, optional
* student needs, optional

Workflow:

1. Intake: gather lesson requirements and desired artifacts.
2. Plan: create the core lesson sequence.
3. Materials: draft slide outline, handout, exit ticket, and differentiation matrix.
4. Review: check alignment, accessibility, privacy, and accommodation implications.
5. Validate: run relevant validators.
6. Handoff: list all artifacts and review requirements.

Agents involved:

* classroom-orchestrator
* lesson-architect
* materials-designer
* differentiation-specialist
* curriculum-alignment-specialist
* accessibility-language-reviewer
* privacy-safeguards-reviewer

Subagent pattern:

* Orchestrator fans out to Lesson Architect, Curriculum Alignment, and Differentiation for the core plan.
* Materials Designer and Accessibility Reviewer work in parallel on artifact drafts.
* Privacy Reviewer checks the combined pack before handoff.

Gates:

* Generic lesson packs may proceed in guided or managed mode.
* Student-specific or accommodation-aware packs require human review before use.

Outputs:

* lesson plan
* slides outline
* student handout
* exit ticket
* differentiation matrix
* validation summary
* handoff

State updates:

* task.workflow: lesson-pack
* outputs.drafts: generated artifact paths
* validation: privacy, alignment, accessibility
* subagents.strategy: fanout_fanin

Example usage:

```text
/lesson-pack grade=4 subject=math topic=fraction comparison duration=60
```
