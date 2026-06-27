# Pack Design

Purpose: Help Codex and specialist agents decide whether to create a new workflow pack, and keep generated packs focused enough to maintain.

Use this tool when a task has a valid use case that is not covered by the installed packs.

Before Scaffolding

1. Check the installed packs with `cubby packs --workspace <workspace>`.
2. Name the unmet use case in one sentence.
3. Confirm the need cannot be handled by adding a workflow, command, template, validator, or agent to an existing pack.
4. Define what the pack includes and what it explicitly excludes.
5. Identify the minimum useful library: workflows, commands, agents, templates, validators, hooks, tools, and skills.

Scaffold

```text
cubby scaffold pack <kebab-name> --need "<unmet use case>"
```

Pack Quality Bar

* A pack should organize a coherent workflow family, not a loose pile of assets.
* Active packs must have a concrete unmet use case, include/exclude scope boundaries, quality checks, validators, and human-review gates.
* Packs should prefer small, composable assets over broad all-purpose instructions.
* Sensitive education outputs must remain draft/review artifacts until a qualified human reviews them.
* If a pack only adds one isolated file, consider extending an existing pack instead.

Validation

1. Generate or update a workspace.
2. Run `cubby validate --workspace <workspace>`.
3. Treat active-pack validation failures as blockers.
4. Treat draft-pack warnings as prompts to tighten scope before activation.
