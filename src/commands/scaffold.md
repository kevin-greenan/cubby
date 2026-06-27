# /scaffold

Purpose: Create starter Cubby source files for new framework workflows, specialist agents, or workflow packs.

Inputs:

* kind: `workflow`, `agent`, or `pack`
* name: lowercase kebab-case source file name

Workflow:

1. Confirm the requested source file does not already exist.
2. Create a workflow YAML, agent Markdown, or pack YAML starter.
3. Keep the starter provider-neutral.
4. Edit and test the new source before relying on it in generated workspaces.

Gates:

* Scaffolded files are repository-development assets, not teacher workspace outputs.
* New sensitive workflows must include human-review gates and validators.

Example usage:

```text
cubby scaffold workflow weekly-plan
cubby scaffold agent math-intervention-specialist
cubby scaffold pack classroom-operations
```
