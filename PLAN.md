Cubby Implementation Plan

Cubby is a portable AI workflow framework for K–5 educators, special education teachers, instructional coaches, BCBAs, interventionists, and related classroom-support professionals.

Cubby is inspired by portable AI workflow frameworks that use shared workflow definitions, adapters, specialist agents, command-like workflows, project-local state, validation gates, and upgrade-safe scaffolding. Cubby is not a software development framework. Its domain is daily teacher work: lesson planning, IEP/accommodation support, parent communication, curriculum development and alignment, sub plans, data collection, scheduling, and classroom administration.

Product Goal

Build a portable, provider-independent AI framework that can be installed into a workspace and used by AI coding/agent tools such as Codex, Claude, ChatGPT, Gemini, or future providers.

Cubby should install a structured workspace containing:

* Shared AI agent definitions
* Reusable workflow protocols
* Command/skill files
* Rules and guardrails
* Templates for teacher-facing outputs
* Project-local state and scratchpad files
* Validation and review gates
* Hooks for continuation, validation, export, diagnosis, and handoff behavior
* Extensions and library packs for domain-specific workflow bundles
* Tools and skills that make common educator tasks faster, safer, and more repeatable
* Adapter-specific files for tools such as Codex
* Upgrade-safe scaffolding that preserves local customization

The first implementation target is Codex, but the architecture must remain platform-independent.

Non-Goals

Cubby is not:

* An LMS
* A SIS
* An IEP management system
* A grading system of record
* A replacement for teacher, IEP team, BCBA, specialist, or family decision-making
* A tool for administrators or higher education, although it may include an optional admin-review persona
* A software engineering assistant

Design Principles

1. Teacher authority
    * The teacher or qualified professional remains the final decision-maker.
    * Cubby drafts, organizes, adapts, validates, and summarizes.
    * Cubby does not silently finalize sensitive educational decisions.
2. Workflow over prompting
    * Users should run clear commands instead of inventing prompts.
    * Complex tasks should follow explicit protocols with intake, context loading, planning, drafting, review, validation, export, and handoff.
3. Specialists over monolith
    * A main orchestrator coordinates focused specialist agents.
    * Specialists should have narrow responsibilities and clear boundaries.
4. Human gates
    * Sensitive workflows require review checkpoints.
    * Parent/family communication, IEP-adjacent output, behavior-related output, data interpretation, and student-specific recommendations must be gated.
5. Autonomous but reviewable
    * Cubby should eventually support long-running workflows.
    * Autonomous mode may draft full artifact bundles but must still preserve validation logs and human-review gates.
6. Project-local state
    * Each workspace tracks current task, phase, progress, blockers, decisions, validation results, and outputs in local state files.
7. Provider independence
    * Shared framework content lives in platform-neutral source files.
    * Thin adapters translate shared content into formats expected by Codex, Claude, ChatGPT, Gemini, Google Workspace, Microsoft 365, etc.
8. Upgrade-safe scaffolding
    * Generated framework files should be marked as managed.
    * Local teacher customization and user-authored artifacts must never be overwritten during upgrades.
9. Student dignity and privacy-aware defaults
    * Outputs should use strengths-based language.
    * Avoid unnecessary student-identifying information.
    * Distinguish observed data, teacher-provided facts, and AI-generated suggestions.
10. Rich performance library
    * Cubby should include a broad, reusable library of hooks, extensions, tools, skills, validators, templates, schemas, and workflow assets.
    * The library should make agent work more reliable by giving agents proven structures instead of relying on one-off prompting.
    * Performance features must remain inspectable, provider-neutral at the source level, and bounded by teacher authority, privacy, and human-review gates.

Target Users

Primary users:

* K–5 general education teachers
* K–5 special education teachers
* Instructional coaches
* BCBAs
* Interventionists
* Related support staff

Secondary user/persona:

* Optional admin-review persona for checking communications, escalation-sensitive documents, schedules, and operational risk

Core Workflows

Cubby should eventually support these workflow families:

Lesson and Curriculum Workflows

* Single lesson plan
* Full lesson pack
* Weekly plan
* Small-group plan
* Centers/stations
* Curriculum alignment
* Rubrics
* Formative assessments
* Material adaptation

Special Education Workflows

* IEP goal support
* Accommodation checks
* Progress-monitoring tools
* Service-session planning
* Goal-aligned instructional activities
* Draft plain-language summaries for review

Behavior and BCBA-Support Workflows

* ABC data sheets
* Behavior observation templates
* Classroom routine supports
* Replacement-skill practice activities
* Reinforcement menu drafts
* Fidelity checklists

Family Communication Workflows

* Parent/family emails
* Conference-prep notes
* Weekly newsletters
* Plain-language explanations
* Celebration notes
* Request-for-input messages

Classroom Operations Workflows

* Sub plans
* Schedules
* Meeting agendas
* Classroom routines
* Checklists
* Supply lists
* Data-collection schedules

Data Workflows

* Data trackers
* Spreadsheet templates
* Progress-monitoring summaries
* Chart-ready data
* Observation coding sheets

Initial MVP Scope

The MVP should be Codex-first but platform-neutral internally.

Implementation support docs live in docs/. They clarify install behavior, workspace ownership, adapter boundaries, managed-file semantics, and MVP acceptance checks. PLAN.md remains the product source of truth if a support doc conflicts with it.

Implement the following:

1. Repository structure
2. Shared source folders
3. Codex adapter
4. Workspace scaffold command
5. Local state schema
6. Orchestrator definition
7. Initial specialist agents
8. Initial commands
9. Initial workflow protocols
10. Initial templates
11. Validation gates
12. Example installed workspace
13. Documentation

Do not start with Google Docs, Microsoft 365, Canvas, Schoology, or live integrations. Those should be adapter extensions after the local framework works.

For the first implementation, keep the shared source platform-neutral but implement only the Codex adapter. Do not create placeholder adapter folders for future providers unless they contain an explicit adapter contract or test fixture needed by the Codex MVP. Future adapters should be added when their install behavior, generated files, and validation expectations are defined.

Initial Repository Structure

Create this structure:

cubby/
  .github/
    workflows/
      quality.yml
  README.md
  LICENSE
  PLAN.md
  docs/
    README.md
    mvp-implementation-guide.md
    workspace-contract.md
    manifest-and-managed-files.md
    adapter-contract.md
    testing-and-acceptance.md
  package.json
  tsconfig.json
  scripts/
    quality_check.py
  src/
    agents/
      classroom-orchestrator.md
      lesson-architect.md
      differentiation-specialist.md
      iep-support-specialist.md
      behavior-support-specialist.md
      curriculum-alignment-specialist.md
      family-communication-specialist.md
      data-progress-specialist.md
      sub-plan-specialist.md
      materials-designer.md
      privacy-safeguards-reviewer.md
      admin-lens-reviewer.md
      accessibility-language-reviewer.md
    workflows/
      lesson-plan.yaml
      lesson-pack.yaml
      parent-email.yaml
      sub-plan.yaml
      accommodation-check.yaml
      iep-goal-support.yaml
      data-tracker.yaml
      behavior-routine.yaml
    commands/
      lesson-plan.md
      lesson-pack.md
      parent-email.md
      sub-plan.md
      accommodation-check.md
      iep-goal-support.md
      data-tracker.md
      behavior-routine.md
      validate.md
      status.md
      resume.md
      handoff.md
    rules/
      core/
        teacher-authority.md
        student-dignity.md
        privacy.md
        human-review.md
        uncertainty.md
        copyright.md
      workflows/
        lesson-planning.md
        parent-communication.md
        iep-support.md
        behavior-support.md
        data-summary.md
        sub-plans.md
      platforms/
        codex.md
        chatgpt.md
        claude.md
        gemini.md
        google-workspace.md
        microsoft-365.md
    templates/
      lesson-plan.md
      lesson-pack/
        lesson-plan.md
        slides-outline.md
        student-handout.md
        exit-ticket.md
        differentiation-matrix.md
      parent-email.md
      sub-plan.md
      accommodation-check.md
      iep-goal-support.md
      abc-data-sheet.csv
      progress-monitoring-sheet.csv
      rubric.md
      meeting-agenda.md
    schemas/
      state.schema.json
      workflow.schema.json
      command.schema.json
      validation-result.schema.json
      artifact.schema.json
      profile.schema.json
    validators/
      privacy-check.yaml
      family-communication-check.yaml
      iep-support-check.yaml
      behavior-support-check.yaml
      accessibility-check.yaml
      alignment-check.yaml
    adapters/
      codex/
        AGENTS.md.template
        install-map.yaml
        commands/
      README.md
    hooks/
      continue.yaml
      diagnose.yaml
      validate.yaml
      export.yaml
    extensions/
      README.md
    tools/
      README.md
    skills/
      README.md
    profiles/
      k5-general.yaml
      k5-special-ed.yaml
      instructional-coach.yaml
      bcba-support.yaml
      interventionist.yaml
  cli/
    init.ts
    upgrade.ts
    validate.ts
    scaffold.ts
    index.ts
  examples/
    k5-special-ed-workspace/
    k5-general-workspace/

Installed Workspace Structure

The cubby init command should create a local teacher workspace like this:

my-classroom-workspace/
  AGENTS.md
  .cubby-version
  cubby/
    config.yaml
    manifest.yaml
    state/
      current-task.yaml
      history/
    local/
      teacher-preferences.yaml
      classroom-context.yaml
      schedule.yaml
      curriculum-map.md
      standards/
      accommodations/
      students/
        README.md
        students.example.yaml
    templates/
      custom/
    outputs/
      lesson-packs/
      parent-emails/
      sub-plans/
      data-trackers/
      meeting-prep/
      behavior-support/
      iep-support/
    exports/
      markdown/
      docx/
      xlsx/
      pptx/
      google-docs/
      word/
      slides/
      sheets/
    logs/
      decisions/
      validations/
      handoffs/

Managed File Header

All generated managed files should include a header similar to:

<!--
managed-by: cubby
managed-version: 0.1.0
local-edits: discouraged
safe-customization: use cubby/local/ or cubby/templates/custom/
-->

For YAML files:

# managed-by: cubby
# managed-version: 0.1.0
# local-edits: discouraged
# safe-customization: use cubby/local/ or cubby/templates/custom/

Manifest Model

Create cubby/manifest.yaml during init.

The manifest is the source of truth for managed files and future upgrade safety. It should record:

* Cubby version
* Adapter name and adapter version
* Profile name
* Workspace creation timestamp
* Managed file entries
* Local-preserved paths

Each managed file entry should include:

* path
* source template or source asset
* managed version
* content hash
* local edits policy

Initial MVP behavior:

* Repeat init may update managed files only when the current file still matches the manifest hash.
* Repeat init must not overwrite files under cubby/local/, cubby/templates/custom/, cubby/outputs/, cubby/exports/, or cubby/logs/.
* If a managed file has local edits, init should preserve it and report a warning.
* Init and upgrade reporting should use these status names: created, skipped, updated, preserved-local-edit, and failed.
* Upgrade can remain dry-run/reporting only until the managed-file behavior is covered by tests.

Local State Model

Create src/schemas/state.schema.json.

The installed workspace should maintain:

task:
  id: "task-YYYY-MM-DD-example"
  title: ""
  workflow: ""
  status: "not_started | in_progress | blocked | waiting_for_review | complete"
  phase: ""
  risk_level: "low | medium | high"
context:
  grade: ""
  subject: ""
  topic: ""
  duration_minutes: null
  audience: []
  platforms: {}
inputs:
  sources: []
  standards: []
  materials: []
  accommodations:
    source: ""
    contains_student_identifiers: false
agents:
  orchestrator: "classroom-orchestrator"
  specialists_called: []
decisions: []
blockers: []
validation:
  privacy:
    status: "not_run | pass | warn | fail"
    notes: ""
  alignment:
    status: "not_run | pass | warn | fail"
    notes: ""
  accessibility:
    status: "not_run | pass | warn | fail"
    notes: ""
  human_review_required:
    required: false
    reason: ""
outputs:
  drafts: []
  exports: []
next_action:
  mode: "continue | pause_for_review | blocked | complete"
  message: ""

Orchestrator Agent

Create src/agents/classroom-orchestrator.md.

The orchestrator is the main coordinator. It should:

* Interpret the teacher’s request.
* Select the correct workflow.
* Load local state.
* Determine risk level.
* Route tasks to specialist agents.
* Maintain the current task file.
* Enforce review gates.
* Synthesize specialist outputs.
* Validate outputs.
* Create handoff summaries.
* Avoid making final high-impact decisions.
* Record assumptions, decisions, blockers, and validation results.

The orchestrator must classify workflows using this model:

risk_levels:
  low:
    examples:
      - generic lesson plan
      - generic worksheet
      - blank rubric
      - generic sub activity
    behavior:
      - may proceed autonomously in managed or autonomous mode
  medium:
    examples:
      - differentiated lesson
      - accommodation-aware material
      - family communication draft
      - data tracker using student-neutral labels
    behavior:
      - may draft autonomously
      - must validate
      - may require human review before export
  high:
    examples:
      - IEP-adjacent text
      - progress interpretation
      - behavior hypothesis
      - discipline-adjacent communication
      - student-specific accommodation recommendation
      - parent email involving concerns
    behavior:
      - must validate
      - must pause for human review
      - must not finalize or send

Specialist Agents

Create the following specialist definitions.

Lesson Architect

File: src/agents/lesson-architect.md

Responsibilities:

* Draft lesson plans.
* Create objectives.
* Design instructional sequence.
* Suggest checks for understanding.
* Create warmups, guided practice, independent practice, and closure.
* Support K–5 developmentally appropriate design.

Differentiation Specialist

File: src/agents/differentiation-specialist.md

Responsibilities:

* Suggest scaffolds.
* Map accommodations to implementation choices.
* Provide alternate response options.
* Support visual, verbal, partner, small-group, and reduced-load adaptations.
* Avoid changing expectations unless explicitly marked as a modification.

IEP Support Specialist

File: src/agents/iep-support-specialist.md

Responsibilities:

* Support goal-aligned activities.
* Draft progress-monitoring structures.
* Create service-session templates.
* Create teacher-review-only draft language.

Boundaries:

* Do not determine eligibility.
* Do not make placement recommendations.
* Do not finalize IEP language.
* Do not infer disability or diagnosis.

Behavior Support Specialist

File: src/agents/behavior-support-specialist.md

Responsibilities:

* Create ABC data sheets.
* Draft observation protocols.
* Suggest antecedent supports.
* Suggest replacement-skill practice.
* Create fidelity checklists.

Boundaries:

* Do not diagnose.
* Do not claim function of behavior as fact.
* Do not create punitive recommendations.
* Label behavior hypotheses as hypotheses.

Curriculum Alignment Specialist

File: src/agents/curriculum-alignment-specialist.md

Responsibilities:

* Align lessons to provided standards.
* Identify prerequisite skills.
* Check objective, activity, and assessment alignment.
* Create standards alignment tables.

Family Communication Specialist

File: src/agents/family-communication-specialist.md

Responsibilities:

* Draft family-facing emails.
* Draft conference-prep talking points.
* Rewrite technical language into family-friendly language.
* Keep tone warm, concise, factual, and professional.

Boundaries:

* Parent/family messages require human review.
* Avoid over-disclosure.
* Avoid unsupported claims.
* Avoid jargon.

Data & Progress Specialist

File: src/agents/data-progress-specialist.md

Responsibilities:

* Create data trackers.
* Create progress-monitoring sheets.
* Summarize data carefully.
* Prepare chart-ready tables.

Boundaries:

* Distinguish observed data from interpretation.
* Avoid unsupported conclusions.
* Human review required for student-specific progress claims.

Sub Plan Specialist

File: src/agents/sub-plan-specialist.md

Responsibilities:

* Create full-day and partial-day sub plans.
* Build fallback activities.
* Create materials checklists.
* Include routine notes and safe classroom management supports.

Materials Designer

File: src/agents/materials-designer.md

Responsibilities:

* Create handouts.
* Create slide outlines.
* Create task cards.
* Create rubrics.
* Create visual schedule drafts.
* Create exit tickets.

Privacy & Safeguards Reviewer

File: src/agents/privacy-safeguards-reviewer.md

Responsibilities:

* Check for student-identifying information.
* Check for over-disclosure.
* Check for stigmatizing or deficit language.
* Flag sensitive exports.
* Require human review when needed.

Admin Lens Reviewer

File: src/agents/admin-lens-reviewer.md

Responsibilities:

* Review tone, operational risk, escalation sensitivity, and school-facing clarity.
* Useful for parent emails, incident-adjacent notes, sub plans, schedules, and meeting preparation.

Boundaries:

* Does not invent policy.
* Does not override teacher judgment.
* Does not act as school leadership.

Accessibility & Language Reviewer

File: src/agents/accessibility-language-reviewer.md

Responsibilities:

* Check clarity, readability, formatting, student-facing directions, and translation readiness.
* Suggest simpler language and more accessible formatting.

Initial Commands

Each command file in src/commands/ should include:

* Purpose
* Inputs
* Workflow
* Agents involved
* Gates
* Outputs
* State updates
* Example usage

Implement these first:

/lesson-plan

Creates a single lesson plan.

Inputs:

* Grade
* Subject
* Topic
* Objective
* Standard, optional
* Duration
* Materials
* Student needs, optional
* Output format

Outputs:

* Lesson plan markdown
* Optional handout
* Validation summary

/lesson-pack

Creates a bundle:

* Lesson plan
* Slide outline
* Student handout
* Exit ticket
* Differentiation matrix
* Validation summary

/parent-email

Drafts a family-facing email.

Inputs:

* Audience
* Purpose
* Context
* Tone
* Must include
* Must avoid

Outputs:

* Email draft
* Review checklist
* Privacy/tone validation

Always requires human review.

/sub-plan

Creates a full-day or partial-day sub plan.

Outputs:

* Schedule
* Materials
* Activities
* Routines
* Student-neutral support notes
* Emergency fallback activities

/accommodation-check

Reviews a lesson or assignment against provided accommodations.

Outputs:

* Accommodation implementation table
* Risks or gaps
* Teacher review notes

/iep-goal-support

Creates goal-aligned activity and data collection supports.

Outputs:

* Goal-aligned activity ideas
* Data sheet
* Progress-monitoring approach
* Review warnings

Always requires human review.

/data-tracker

Creates spreadsheet-ready tracking templates.

Outputs:

* CSV or XLSX-ready schema
* Data dictionary
* Suggested collection schedule

/behavior-routine

Creates classroom routine supports.

Outputs:

* Routine plan
* Antecedent supports
* Replacement-skill practice
* Reinforcement options
* Fidelity checklist
* Review warnings

/validate

Runs validation gates against current task outputs.

/status

Summarizes current task, phase, blockers, validation status, outputs, and next action.

/resume

Continues from cubby/state/current-task.yaml.

/handoff

Creates a final summary of what was produced, what requires review, where outputs are located, and suggested next steps.

Workflow Protocol Schema

Create src/schemas/workflow.schema.json.

Each workflow YAML should support:

id: ""
name: ""
description: ""
risk_level: "low | medium | high"
phases:
  - id: "intake"
    agent: "classroom-orchestrator"
    required: true
  - id: "draft"
    agent: ""
    required: true
  - id: "review"
    agents: []
    required: true
  - id: "validation"
    validators: []
    required: true
  - id: "human_gate"
    required: false
  - id: "export"
    required: false
  - id: "handoff"
    agent: "classroom-orchestrator"
    required: true
outputs:
  - type: ""
    path_template: ""
gates:
  human_review_required: false
  validators: []
autonomy:
  guided: {}
  managed: {}
  autonomous: {}

Initial Workflow Files

Create these workflow files:

* src/workflows/lesson-plan.yaml
* src/workflows/lesson-pack.yaml
* src/workflows/parent-email.yaml
* src/workflows/sub-plan.yaml
* src/workflows/accommodation-check.yaml
* src/workflows/iep-goal-support.yaml
* src/workflows/data-tracker.yaml
* src/workflows/behavior-routine.yaml

Validation Gates

Create validator definitions in src/validators/.

Privacy Check

File: src/validators/privacy-check.yaml

Checks:

* Student name
* Student ID
* Date of birth
* Disability label
* Behavior record
* Medical information
* Family/private details
* Overly specific schedule or location details
* Sensitive details in file names

Results:

* pass
* warn
* fail

Family Communication Check

File: src/validators/family-communication-check.yaml

Checks:

* Warm tone
* Factual language
* No blame
* No unsupported claims
* Minimal jargon
* Human review required
* Clear call to action when appropriate

IEP Support Check

File: src/validators/iep-support-check.yaml

Checks:

* Draft status is clear
* No eligibility determination
* No placement recommendation
* No legal conclusion
* Goal alignment is traceable
* Human review required

Behavior Support Check

File: src/validators/behavior-support-check.yaml

Checks:

* No diagnosis
* No unsupported function claim
* Hypotheses labeled as hypotheses
* No punitive framing
* Includes data collection or observation component
* Human review required

Accessibility Check

File: src/validators/accessibility-check.yaml

Checks:

* Clear directions
* Developmentally appropriate language
* Visual structure
* Alternate response options when relevant
* Cognitive load
* Translation readiness for family-facing text

Alignment Check

File: src/validators/alignment-check.yaml

Checks:

* Objective aligns to activity
* Activity aligns to assessment
* Materials match planned task
* Timing is realistic
* Standard alignment is noted as teacher-confirmed if not provided

Rules

Create core rules in src/rules/core/.

teacher-authority.md

Must state:

* Cubby assists but does not decide.
* Teacher or qualified professional approves final outputs.
* Sensitive decisions require human review.

student-dignity.md

Must state:

* Use strengths-based language.
* Avoid deficit framing.
* Avoid labels-as-identity.
* Avoid speculation about motivation, diagnosis, family, or home context.

privacy.md

Must state:

* Avoid student-identifying information by default.
* Use pseudonyms or initials when possible.
* Flag sensitive data before export.
* Do not include sensitive details in filenames.

human-review.md

Must state:

Human review is required for:

* Parent/family communication
* IEP-adjacent text
* Behavior support recommendations
* Progress interpretation
* Student-specific accommodation recommendations
* Discipline-adjacent content
* Any output containing sensitive student information

uncertainty.md

Must state:

* Distinguish observed data from interpretation.
* Label assumptions.
* Ask for missing critical context when needed.
* Use cautious language when evidence is incomplete.

copyright.md

Must state:

* Prefer original materials.
* Do not reproduce copyrighted curriculum verbatim unless user provides material and explicitly asks for permitted transformation.
* Summarize, adapt, or create alternatives when appropriate.

Profiles

Create profile files in src/profiles/.

k5-general.yaml

Default agents:

* classroom-orchestrator
* lesson-architect
* curriculum-alignment-specialist
* differentiation-specialist
* materials-designer
* family-communication-specialist
* privacy-safeguards-reviewer

Default commands:

* lesson-plan
* lesson-pack
* weekly-plan
* parent-email
* sub-plan
* rubric
* data-tracker

k5-special-ed.yaml

Default agents:

* classroom-orchestrator
* lesson-architect
* differentiation-specialist
* iep-support-specialist
* behavior-support-specialist
* data-progress-specialist
* family-communication-specialist
* privacy-safeguards-reviewer
* accessibility-language-reviewer

Default commands:

* lesson-plan
* lesson-pack
* accommodation-check
* iep-goal-support
* progress-monitoring
* data-tracker
* behavior-routine
* parent-email
* sub-plan

instructional-coach.yaml

Default agents:

* classroom-orchestrator
* lesson-architect
* curriculum-alignment-specialist
* accessibility-language-reviewer
* admin-lens-reviewer
* privacy-safeguards-reviewer

Default commands:

* lesson-plan
* lesson-pack
* align-standards
* meeting-agenda
* conference-prep
* data-summary

bcba-support.yaml

Default agents:

* classroom-orchestrator
* behavior-support-specialist
* data-progress-specialist
* privacy-safeguards-reviewer
* family-communication-specialist
* admin-lens-reviewer

Default commands:

* abc-data-sheet
* behavior-routine
* replacement-skill
* fidelity-checklist
* data-tracker
* parent-email

interventionist.yaml

Default agents:

* classroom-orchestrator
* lesson-architect
* differentiation-specialist
* data-progress-specialist
* materials-designer
* privacy-safeguards-reviewer

Default commands:

* small-group
* progress-monitoring
* data-tracker
* lesson-plan
* parent-email

Adapter Architecture

Shared content in src/ must remain platform-neutral.

Adapters should transform shared source files into provider-specific files.

Initial adapter: Codex.

MVP adapter rule:

* Implement only src/adapters/codex/.
* Document the future adapter contract in src/adapters/README.md.
* Do not scaffold empty provider directories for Claude, ChatGPT, Gemini, Google Workspace, or Microsoft 365 in Milestones 1-2.
* Provider-neutral behavior belongs in agents, commands, workflows, rules, templates, schemas, validators, hooks, extensions, tools, skills, and profiles, not in Codex-specific files.

Performance Library

Cubby should include a liberal library of reusable performance assets over time. This library should make the framework very high-performing by giving agents explicit, validated structures for common educator work.

Library families:

* hooks for continuation, validation, export, diagnose, repair, and handoff decisions
* extensions for domain-specific packs such as lesson planning, family communication, special education, behavior support, data tracking, accessibility, and export generation
* tools for validation, conversion, redaction, indexing, manifest inspection, artifact generation, and quality checks
* skills for portable, platform-rendered task behavior
* validators, schemas, templates, profiles, rules, commands, workflows, and specialist agents

MVP behavior:

* Create clear source locations for hooks, extensions, tools, and skills.
* Hooks may remain declarative YAML and documentation.
* Tools may start with the CLI and repository quality checks.
* Skills may start as command and agent Markdown until platform-specific skill packaging is defined.
* Extensions may start as a documented source folder and future pack contract.
* Do not add opaque automation or sensitive decision-making tools without review gates.

Codex Adapter

Generate:

* AGENTS.md
* Command files if needed
* Local rules summary
* Workflow instructions
* State conventions

AGENTS.md distinction:

* Root AGENTS.md is a repository-development guide for coding agents working on Cubby itself.
* Generated workspace AGENTS.md is a Codex adapter output for teacher workspaces.
* The root AGENTS.md must not be copied into installed workspaces; installed workspaces should use src/adapters/codex/AGENTS.md.template.

src/adapters/codex/AGENTS.md.template should include:

* Cubby overview
* Orchestrator behavior
* Available commands
* Specialist role summaries
* State file location
* Validation gate requirements
* Human-review rules
* Output path conventions
* Managed-file warning

The installed AGENTS.md should instruct Codex to:

1. Read cubby/state/current-task.yaml before continuing a Cubby task.
2. Use command files for workflow behavior.
3. Update local state after each major phase.
4. Run or simulate validation gates before handoff.
5. Pause when human review is required.
6. Write outputs into cubby/outputs/.
7. Avoid overwriting local templates.
8. Preserve sensitive output as drafts only.

CLI Requirements

Use TypeScript for the initial CLI.

Commands:

cubby init
cubby init --profile k5-special-ed --adapter codex --workspace ./my-classroom
cubby validate
cubby upgrade
cubby scaffold workflow <name>
cubby scaffold agent <name>

cubby init

Should:

1. Create workspace directories.
2. Copy managed templates.
3. Render adapter files.
4. Create .cubby-version.
5. Create cubby/config.yaml.
6. Create cubby/manifest.yaml.
7. Create default cubby/state/current-task.yaml.
8. Create local customization files.
9. Print next steps.

cubby validate

Should:

1. Validate schemas.
2. Validate installed workspace structure.
3. Check required files.
4. Check current task file.
5. Report pass/warn/fail.

cubby upgrade

Should:

1. Read .cubby-version.
2. Read manifest.yaml.
3. Detect managed files.
4. Preserve local files.
5. Preserve outputs.
6. Preserve custom templates.
7. Detect local edits to managed files.
8. Apply safe updates.
9. Print migration report.

For MVP, upgrade may be a dry-run/reporting command before it actually mutates files.

Package Scripts

Add package scripts:

{
  "scripts": {
    "build": "tsc",
    "check": "tsc --noEmit",
    "quality": "python3 scripts/quality_check.py",
    "test": "node --test tests/*.test.mjs",
    "init:example": "node dist/cli/index.js init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace",
    "validate:example": "node dist/cli/index.js validate --workspace ./examples/k5-special-ed-workspace"
  }
}

Output Artifact Conventions

Generated outputs should live under:

cubby/outputs/<workflow-family>/<task-slug>/

Example:

cubby/outputs/lesson-packs/main-idea-grade-2/
  lesson-plan.md
  slides-outline.md
  student-handout.md
  exit-ticket.md
  differentiation-matrix.md
  validation-summary.md
  handoff.md

All output folders should include a handoff.md file summarizing:

* Request
* Outputs produced
* Assumptions
* Decisions
* Validation results
* Review requirements
* Suggested next steps

Autonomy Modes

Support these modes in cubby/config.yaml:

autonomy:
  mode: "guided | managed | autonomous"
  allow_autonomous:
    - "lesson-plan"
    - "lesson-pack"
    - "sub-plan"
    - "rubric"
    - "data-tracker"
  require_human_gate:
    - "parent-email"
    - "iep-goal-support"
    - "behavior-routine"
    - "progress-summary"
    - "student-specific-accommodation"
  allow_exports_without_review:
    - "generic lesson materials"
    - "blank templates"
  block_exports_without_review:
    - "family communication"
    - "student-specific records"
    - "IEP-related summaries"
    - "behavior-related summaries"

MVP behavior:

* Guided and managed modes can be implemented as configuration values.
* Full autonomous continuation can be scaffolded but does not need to be fully automated yet.
* The state machine should be designed so autonomous continuation can be added later.

Hook-Driven Continuation

Create hook definitions in src/hooks/.

The conceptual continuation logic:

After each AI turn:
  1. Read cubby/state/current-task.yaml.
  2. If status is blocked, stop and summarize blocker.
  3. If phase requires human_gate, pause.
  4. If validation failed, route to reviewer or request correction.
  5. If outputs are missing and autonomy allows continuation, continue.
  6. If export is pending and export gate passed, export.
  7. If task is complete, write handoff summary.

Create a hook decision schema:

hook_decision:
  action: "continue | pause | stop | diagnose | export | validate"
  reason: ""
  next_agent: ""
  next_command: ""

For MVP, hooks may be declarative YAML files and documentation rather than executable automations.

MVP Milestones

Milestone 1: Repository Skeleton

Deliverables:

* Directory structure
* README
* This plan.md
* Initial TypeScript project setup
* CLI entrypoint
* Empty or draft source files for agents, commands, workflows, rules, templates, schemas, validators, adapters, hooks, extensions, tools, skills, and profiles

Acceptance criteria:

* npm install works.
* npm run check works.
* Repository has the intended structure.
* README explains Cubby clearly.

Milestone 2: Codex Workspace Scaffolding

Deliverables:

* cubby init
* Codex adapter rendering
* Generated AGENTS.md
* Workspace folder structure
* .cubby-version
* cubby/config.yaml
* cubby/manifest.yaml
* Default cubby/state/current-task.yaml

Acceptance criteria:

* Running cubby init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace creates a usable workspace.
* Generated files contain managed headers.
* Local customization folders are created but not overwritten on repeat runs.

Definition of usable workspace:

* AGENTS.md gives Codex enough instruction to identify Cubby, available commands, state location, output location, validation expectations, and human-review gates.
* cubby/state/current-task.yaml exists, validates against the state schema, and can represent not_started, in_progress, blocked, waiting_for_review, and complete tasks.
* cubby/config.yaml records profile, adapter, autonomy mode, output conventions, and review-gate defaults.
* cubby/manifest.yaml records every managed file with enough metadata to detect local edits later.
* cubby validate --workspace reports pass/warn/fail for required workspace shape and current task validity.
* A repeat init preserves local files and reports managed-file outcomes using created, skipped, updated, preserved-local-edit, and failed.

Milestone 3: Core Agents and Rules

Deliverables:

* Classroom Orchestrator
* Lesson Architect
* Differentiation Specialist
* Family Communication Specialist
* Privacy Reviewer
* Core rules

Acceptance criteria:

* AGENTS.md references these agents.
* Commands can route to these agents conceptually.
* Human-review requirements are clear.

Milestone 4: Initial Commands and Workflows

Deliverables:

* /lesson-plan
* /lesson-pack
* /parent-email
* /sub-plan
* /validate
* /status
* /resume
* /handoff
* Workflow YAML files

Acceptance criteria:

* Each command has purpose, inputs, workflow, agents, gates, outputs, and example usage.
* Each workflow has phases, outputs, gates, and autonomy behavior.

Milestone 5: Templates and Outputs

Deliverables:

* Lesson plan template
* Lesson pack templates
* Parent email template
* Sub plan template
* Validation summary template
* Handoff template

Acceptance criteria:

* Commands specify which templates to use.
* Output paths are standardized.
* Example workspace includes sample generated output or placeholder examples.

Milestone 6: Validation System

Deliverables:

* Validator YAML files
* Validation result schema
* cubby validate workspace checker
* Documentation for validation gates

Acceptance criteria:

* cubby validate --workspace ./examples/k5-special-ed-workspace reports workspace health.
* Validator definitions cover privacy, family communication, IEP support, behavior support, accessibility, and alignment.
* Sensitive workflows clearly require human review.

Milestone 7: Special Education and Behavior Support Pack

Deliverables:

* IEP Support Specialist
* Behavior Support Specialist
* Data & Progress Specialist
* Accessibility & Language Reviewer
* /iep-goal-support
* /accommodation-check
* /data-tracker
* /behavior-routine

Acceptance criteria:

* Special education workflows are clearly draft/review oriented.
* IEP-adjacent and behavior-adjacent outputs require human review.
* Data collection templates avoid unsupported interpretation.

Milestone 8: Upgrade-Safe Scaffolding

Deliverables:

* Manifest format
* Managed-file detection
* Dry-run upgrade report
* Local customization preservation

Acceptance criteria:

* cubby upgrade --workspace ./examples/k5-special-ed-workspace --dry-run reports what would change.
* Local files under cubby/local/, cubby/templates/custom/, cubby/outputs/, cubby/exports/, and cubby/logs/ are never overwritten.

Milestone 9: Documentation and Examples

Deliverables:

* README usage guide
* Example K–5 general workspace
* Example K–5 special education workspace
* Example command walkthroughs
* Safety and review-gate documentation

Acceptance criteria:

* A new user can understand what Cubby is, initialize a workspace, and run the conceptual workflows using Codex.
* Documentation makes clear that Cubby assists teachers but does not replace professional judgment.

Initial README Content Requirements

The README should include:

* What Cubby is
* Who it is for
* What it can help with
* What it is not
* Installation
* Quickstart
* Example commands
* Workspace structure
* Autonomy modes
* Human-review gates
* Adapter architecture
* Development roadmap

Coding Guidance

Prefer simple, boring implementation choices.

Use:

* TypeScript
* Node.js
* YAML for workflows, profiles, validators, and config
* JSON Schema for validation
* Markdown for agents, commands, rules, and templates

Avoid premature complexity:

* No database in MVP
* No web app in MVP
* No live Google/Microsoft integration in MVP
* No LMS integration in MVP
* No authentication system in MVP
* No background daemon in MVP

Suggested Dependencies

Consider:

* commander for CLI parsing
* yaml for YAML parsing/writing
* ajv for JSON Schema validation
* fs-extra for filesystem operations
* zod only if preferred over JSON Schema for internal TypeScript validation
* Node's built-in test runner for MVP tests

Testing Strategy

Add tests for:

* CLI argument parsing
* Workspace initialization
* Managed-file header insertion
* Existing local file preservation
* Manifest creation
* Output/export/log directory preservation
* State schema validation
* Workflow schema validation
* Profile schema validation
* Repeat init safety
* Upgrade dry-run behavior

Example test cases:

1. init creates expected directories.
2. init creates AGENTS.md.
3. init creates .cubby-version.
4. init does not overwrite cubby/local/teacher-preferences.yaml if it already exists.
5. validate passes on a fresh workspace.
6. validate fails if current-task.yaml is malformed.
7. upgrade --dry-run reports changes without modifying files.
8. repeat init and upgrade --dry-run do not modify files under cubby/outputs/, cubby/exports/, or cubby/logs/.

First Codex Task

Start by implementing Milestone 1 and Milestone 2 only.

Do not implement every workflow in full yet. Create the skeleton and make the install experience real.

Specific first task:

1. Set up TypeScript project.
2. Create the repository folder structure.
3. Add initial source files with meaningful placeholder content.
4. Implement cli/index.ts.
5. Implement cubby init.
6. Support these arguments:
    * --profile
    * --adapter
    * --workspace
7. Render the Codex AGENTS.md from src/adapters/codex/AGENTS.md.template.
8. Create installed workspace directories.
9. Create .cubby-version.
10. Create cubby/config.yaml.
11. Create cubby/manifest.yaml.
12. Create cubby/state/current-task.yaml.
13. Add managed headers to generated files.
14. Ensure repeat runs do not overwrite local customization files.
15. Add basic tests.
16. Update README with quickstart.

Acceptance check:

npm install
npm run quality
npm run check
npm run build
npm test
node dist/cli/index.js init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js validate --workspace ./examples/k5-special-ed-workspace

Also verify:

* Running init a second time does not overwrite cubby/local/teacher-preferences.yaml.
* Modifying a managed AGENTS.md causes repeat init to preserve the file and report a warning.
* cubby/manifest.yaml includes path, source, managed version, content hash, and local edit policy for generated managed files.

Expected result:

* The example workspace is created.
* AGENTS.md exists.
* cubby/state/current-task.yaml exists.
* cubby/config.yaml exists.
* cubby/manifest.yaml exists.
* Validation passes.
* Local customization files are preserved on repeated init.

Future Roadmap

After MVP:

1. Add DOCX generation.
2. Add XLSX generation.
3. Add PPTX generation.
4. Add Google Workspace adapter.
5. Add Microsoft 365 adapter.
6. Add Claude adapter.
7. Add ChatGPT project adapter.
8. Add Gemini adapter.
9. Add LMS export adapters.
10. Add richer autonomous continuation.
11. Add guided intake forms.
12. Add sample teacher workspaces.
13. Add school/district policy overlay support.
14. Add optional redaction utilities.
15. Add artifact index and search.
16. Add visual schedule and printable-material generators.

Product Tone

Cubby should feel warm, practical, and teacher-centered.

Avoid making it sound like an enterprise compliance appliance. Also avoid making it childish.

The tone should be:

* Helpful
* Calm
* Warm
* Clear
* Professional
* Respectful of teachers’ expertise

Cubby should feel like a well-organized classroom cart: everything labeled, easy to reach, and ready before the bell rings.
