# Cubby

Cubby is a portable AI workflow framework for K-5 educators, special education teachers, instructional coaches, BCBAs, interventionists, and related classroom-support professionals.

The first local release is a Codex-ready workspace scaffold. It installs workflow instructions, state files, templates, and validation conventions into a teacher workspace while preserving local customization.

Cubby is also designed to grow a rich performance library: subagent orchestration protocols, hooks, extensions, tools, skills, validators, templates, profiles, and adapter mappings that make agent-supported educator workflows faster, safer, and more repeatable.

Installed workspaces receive a managed copy of that library under `cubby/framework/`, while local context, custom templates, outputs, exports, and logs remain user-owned.

## Quickstart

Install dependencies and build the CLI:

```text
npm install
npm run check
npm run build
```

Create an example workspace:

```text
node dist/cli/index.js init --profile k5-special-ed --adapter codex --workspace ./examples/k5-special-ed-workspace
```

Validate it:

```text
node dist/cli/index.js validate --workspace ./examples/k5-special-ed-workspace
```

Start a workflow, inspect task status, or preview managed-file changes:

```text
node dist/cli/index.js start lesson-plan --workspace ./examples/k5-special-ed-workspace --title "Main idea lesson" --grade 2 --subject ELA --topic "main idea" --duration 45
node dist/cli/index.js status --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js advance --workspace ./examples/k5-special-ed-workspace --complete-subagents
node dist/cli/index.js resume --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js handoff --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js artifacts --workspace ./examples/k5-special-ed-workspace --query lesson
node dist/cli/index.js redact --workspace ./examples/k5-special-ed-workspace --source cubby/outputs/parent-emails/example/email-draft.md
node dist/cli/index.js export --workspace ./examples/k5-special-ed-workspace --source cubby/outputs/lesson-packs/example/lesson-plan.md
node dist/cli/index.js complete --workspace ./examples/k5-special-ed-workspace --note "Lesson draft reviewed for demo readiness."
node dist/cli/index.js manifest --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js packs --workspace ./examples/k5-special-ed-workspace
node dist/cli/index.js upgrade --workspace ./examples/k5-special-ed-workspace --dry-run
```

Run the current quality checks:

```text
npm run quality
npm test
```

Run the lifecycle demo after building the CLI to create an inspectable workspace under `/tmp`:

```text
npm run demo:lifecycle
```

## Development Notes

Use `docs/` as the release-facing source of truth for the install loop, managed-file behavior, adapter boundary, command surface, walkthroughs, and test expectations.

Start with [docs/performance-library.md](docs/performance-library.md) when adding hooks, extensions, tools, skills, or reusable workflow packs.

Use [docs/walkthrough-lifecycle.md](docs/walkthrough-lifecycle.md) for the full teacher workflow from init through start, draft output, validation, handoff, export, and artifact inspection.

See [examples/sample-outputs](examples/sample-outputs) for small, fictional examples of generated artifacts, validation summaries, handoffs, and review-gated family communication.

Installed workspaces receive a generated `AGENTS.md` rendered from the Codex adapter template. The repository root does not carry a development-only `AGENTS.md` in release-ready branches.
