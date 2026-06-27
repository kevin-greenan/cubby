# Subagent Orchestration

The classroom orchestrator should treat subagents as short-lived specialist workers.

## Spawn

Before spawning a subagent, the orchestrator should define:

* specialist ID
* purpose
* source context
* excluded work
* expected output format
* validation or human-review gate

## Fan Out

Fan out when two or more specialists can work independently, such as lesson structure, differentiation, materials, privacy, and family-language review.

Fan-out subagents must receive the same source context unless their task packet explicitly narrows it. Each subagent should return findings, assumptions, risks, and draft snippets separately.

## Fan In

The orchestrator owns fan-in. During fan-in, it should:

* compare specialist outputs against the workflow goal
* resolve contradictions
* avoid duplicating content
* preserve teacher-provided facts over generated suggestions
* identify remaining assumptions or blockers
* update task state and validation status

The orchestrator must not treat subagent output as automatically approved. Sensitive outputs remain drafts until the required human gate is complete.
