# Adapter Contract

Adapters translate shared Cubby source into files and conventions for a specific AI tool or platform.

## MVP Adapter

The MVP implements only:

```text
src/adapters/codex/
```

Do not create empty adapter folders for future providers during Milestones 1 and 2.

## Shared Source

Provider-neutral content belongs in:

```text
src/agents/
src/workflows/
src/commands/
src/rules/
src/templates/
src/schemas/
src/validators/
src/hooks/
src/extensions/
src/tools/
src/skills/
src/profiles/
```

Shared source should not assume Codex-specific behavior unless the plan explicitly calls for it.

## Adapter Source

Provider-specific content belongs under:

```text
src/adapters/<adapter-name>/
```

For Codex, the key MVP file is:

```text
src/adapters/codex/AGENTS.md.template
```

That template renders the installed workspace `AGENTS.md`.

## Adapter Responsibilities

An adapter may:

* Render provider-specific instruction files.
* Map shared commands into provider-readable guidance.
* Map shared skills and tools into provider-supported formats when available.
* Summarize relevant rules and validation gates.
* Define output conventions expected by the provider.
* Include adapter-specific installation metadata.

An adapter should not:

* Own the core product model.
* Duplicate shared rules unnecessarily.
* Introduce live integrations during MVP.
* Copy repository-development instructions into installed workspaces.

## Future Adapter Checklist

Before adding a future adapter, define:

* generated files
* required source templates
* install-map behavior
* skill and tool mapping behavior
* validation expectations
* managed-file metadata
* tests proving install output
