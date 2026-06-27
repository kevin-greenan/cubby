# Subagents

Cubby uses subagents as bounded specialist calls coordinated by the classroom orchestrator. The orchestrator owns task state, teacher-authority gates, and final synthesis; subagents provide focused analysis or drafts for a narrow packet of work.

Use subagents when a workflow benefits from parallel specialist review, domain-specific drafting, or independent validation. Do not use subagents to bypass human review, make sensitive decisions, or obscure why an output was produced.

## Core Pattern

1. Select specialist subagents from `cubby/framework/agents/`.
2. Create a task packet with purpose, inputs, boundaries, expected output, and review gates.
3. Spawn subagents sequentially or in fan-out when the adapter supports it.
4. Record each call in `cubby/state/current-task.yaml` under `subagents.calls`.
5. Fan results back into the orchestrator.
6. Resolve conflicts, label assumptions, run validation, and pause when human review is required.

## State Contract

The current task file tracks:

* `subagents.strategy`: `none`, `sequential`, `parallel`, or `fanout_fanin`
* `subagents.fanout`: requested and completed specialist IDs
* `subagents.calls`: call IDs, specialist IDs, purpose, status, inputs, outputs, and notes

Adapters may translate this pattern into native multi-agent, tool, thread, or skill mechanisms. Shared Cubby source should remain provider-neutral.
