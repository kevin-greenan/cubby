# Performance Library

Cubby should become a high-performing framework because it ships with a rich, composable library of workflow assets.

The core framework is not only agents and commands. It should include subagent orchestration protocols, hooks, extensions, tools, skills, validators, schemas, templates, profiles, adapter mappings, review gates, and reusable classroom workflow patterns.

## Library Families

Cubby's shared source should grow across these families:

* agents: focused specialist role definitions
* subagents: protocols for bounded specialist spawning, fan-out, fan-in, and orchestrator synthesis
* workflows: phase-based protocols for common educator tasks
* commands: teacher-friendly entrypoints into workflows
* rules: durable safety, tone, privacy, and workflow guidance
* templates: reusable output formats and artifact starters
* validators: review gates and quality checks for generated artifacts
* hooks: continuation, validation, export, diagnose, and handoff decision points
* extensions: optional domain packs that add workflows, templates, validators, hooks, tools, skills, profile defaults, or adapter mappings
* tools: executable helpers for generation, validation, conversion, export, redaction, or indexing
* skills: portable task instructions that agent platforms can expose directly
* profiles: role-specific bundles for teachers, special education, coaching, BCBA support, and intervention
* adapters: provider-specific renderers and install mappings

## Performance Goal

The library should make common educator work faster, safer, and more consistent by giving agents reusable structure instead of asking users to invent prompts.

High performance means:

* the right workflow is easy to select
* context is loaded consistently
* specialist work can be spawned, fanned out, and synthesized without losing reviewability
* outputs use proven templates
* sensitive tasks trigger review gates
* validation is visible and repeatable
* handoffs are complete enough to resume later
* generated artifacts are easy for educators to inspect and revise
* adapters stay thin because shared source carries most of the product behavior

## MVP Boundary

Milestones 1 and 2 should create the folders, contracts, and representative starter files needed for the performance library, but they do not need to implement a large executable tool ecosystem yet.

For MVP:

* hooks may remain declarative YAML and documentation
* tools may be limited to CLI commands and quality checks
* skills may be represented as command and agent Markdown until platform-specific skill packaging is defined
* subagents may be represented as provider-neutral orchestration docs and task-packet conventions until adapter-native fan-out is available
* extensions may be represented by a documented source folder and future contract
* validators may be declarative definitions plus workspace validation logic

After the install/validate loop works, Cubby should expand the library aggressively in focused packs.

## Extension Packs

Extension packs should be additive and reviewable. A pack may include:

* agents
* subagents
* commands
* workflows
* templates
* validators
* hooks
* tools
* skills
* profile defaults
* adapter mappings

Potential v1 packs:

* lesson and curriculum pack
* family communication pack
* special education support pack
* behavior and BCBA-support pack
* data and progress-monitoring pack
* sub plan and classroom operations pack
* accessibility and language pack
* export and artifact-generation pack

Packs must preserve the same privacy, dignity, teacher-authority, and human-review rules as the core framework.

## Tooling Expectations

Tools should be small, inspectable, and deterministic where possible. Prefer tools that improve reliability or educator usefulness:

* workspace validation
* manifest inspection
* managed-file diff reports
* privacy and filename checks
* CSV/XLSX generation
* Markdown-to-DOCX export
* artifact indexing
* redaction helpers
* template linting
* workflow schema validation
* handoff generation

Avoid tools that create opaque behavior or make sensitive decisions without review. Tool output should be visible in logs, validation summaries, manifests, or handoffs when it affects user-facing artifacts.

## Skill Expectations

Skills should package high-value task behavior for agent platforms that support reusable skills or commands.

Good Cubby skills should include:

* purpose
* required inputs
* context loading steps
* workflow phases
* specialist routing
* validation gates
* output paths
* human-review requirements
* handoff expectations

Skills should remain provider-neutral at the source level and be rendered through adapters when a platform needs a specific format.
