#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${TMPDIR:-/tmp}/cubby-workspace-smoke"
CLI="dist/cli/index.js"

rm -rf "$WORKSPACE"

node "$CLI" init --profile k5-special-ed --adapter codex --workspace "$WORKSPACE"
node "$CLI" start lesson-plan --workspace "$WORKSPACE" --title "Demo lesson" --grade 2 --subject ELA --topic "main idea" --duration 45
node "$CLI" status --workspace "$WORKSPACE"
node "$CLI" advance --workspace "$WORKSPACE" --complete-subagents
node "$CLI" resume --workspace "$WORKSPACE"

mkdir -p "$WORKSPACE/cubby/outputs/lesson-packs/demo"
printf '# Demo lesson\n' > "$WORKSPACE/cubby/outputs/lesson-packs/demo/lesson-plan.md"

mkdir -p "$WORKSPACE/cubby/outputs/parent-emails/demo"
printf 'Email: family@example.com\nStudent Name: Jordan\n' > "$WORKSPACE/cubby/outputs/parent-emails/demo/email-draft.md"

node "$CLI" export --workspace "$WORKSPACE" --source cubby/outputs/lesson-packs/demo/lesson-plan.md
node "$CLI" artifacts --workspace "$WORKSPACE" --query lesson-packs
node "$CLI" redact --workspace "$WORKSPACE" --source cubby/outputs/parent-emails/demo/email-draft.md
node "$CLI" handoff --workspace "$WORKSPACE"
node "$CLI" manifest --workspace "$WORKSPACE"
node "$CLI" upgrade --workspace "$WORKSPACE" --dry-run
node "$CLI" validate --workspace "$WORKSPACE"

test -f "$WORKSPACE/cubby/exports/markdown/lesson-packs/demo/lesson-plan.md"
test -f "$WORKSPACE/cubby/logs/artifacts/index.yaml"
find "$WORKSPACE/cubby/logs/redactions" -type f -name 'redaction-*.yaml' | grep -q .

echo "Workspace smoke passed: $WORKSPACE"
