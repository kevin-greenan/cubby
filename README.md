# Cubby

Cubby is a portable AI workflow framework for K-5 educators, special education teachers, instructional coaches, BCBAs, interventionists, and related classroom-support professionals.

The first MVP is a Codex-ready workspace scaffold. It installs local workflow instructions, state files, templates, and validation conventions into a teacher workspace while preserving local customization.

Cubby is also designed to grow a rich performance library: hooks, extensions, tools, skills, validators, templates, profiles, and adapter mappings that make agent-supported educator workflows faster, safer, and more repeatable.

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

Run the current quality checks:

```text
npm run quality
npm test
```

## Development Notes

Use `PLAN.md` as the product source of truth. Use `docs/` for the implementation contracts that define the MVP install loop, managed-file behavior, adapter boundary, and test expectations.

Start with [docs/performance-library.md](docs/performance-library.md) when adding hooks, extensions, tools, skills, or reusable workflow packs.

The root `AGENTS.md` is for repository development only. Installed workspaces receive a generated `AGENTS.md` rendered from the Codex adapter template.
