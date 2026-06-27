# /scaffold

Purpose: Create starter Cubby source files for new framework workflows, specialist agents, or workflow packs.

Inputs:

* kind: `workflow`, `agent`, or `pack`
* name: lowercase kebab-case source file name
* need: optional unmet-use-case sentence for pack scaffolds

Workflow:

1. Confirm the requested source file does not already exist.
2. For new packs, review `cubby/framework/tools/pack-design.md` and confirm the use case is not already covered.
3. Create a workflow YAML, agent Markdown, or pack YAML starter.
4. For pack starters, define the unmet use case, include/exclude scope, quality checks, and review gates before activation.
5. Keep the starter provider-neutral.
6. Edit and test the new source before relying on it in generated workspaces.

Gates:

* Scaffolded files are repository-development assets, not teacher workspace outputs.
* New sensitive workflows must include human-review gates and validators.
* Active packs must pass pack quality validation with concrete scope and no placeholder language.

Example usage:

```text
cubby scaffold workflow weekly-plan
cubby scaffold agent math-intervention-specialist
cubby scaffold pack classroom-operations --need "Teachers need a coordinated daily operations pack for recurring classroom routines."
```
