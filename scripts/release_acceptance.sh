#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${1:-${TMPDIR:-/tmp}/cubby-release-acceptance}"
CLI="dist/cli/index.js"
LOG_ROOT="$WORKSPACE/.acceptance-logs"

rm -rf "$WORKSPACE"
mkdir -p "$LOG_ROOT"

show_logs() {
  local status=$?
  if [[ "$status" -ne 0 ]]; then
    for log in "$LOG_ROOT"/*.log; do
      if [[ -f "$log" ]]; then
        echo "--- ${log##*/} ---"
        cat "$log"
      fi
    done
  fi
  exit "$status"
}
trap show_logs EXIT

run_logged() {
  local name="$1"
  shift
  "$@" > "$LOG_ROOT/$name.log"
}

run_logged init node "$CLI" init --profile k5-special-ed --adapter codex --workspace "$WORKSPACE"
run_logged validate-initial node "$CLI" validate --workspace "$WORKSPACE"
run_logged start node "$CLI" start lesson-plan --workspace "$WORKSPACE" --title "Main idea lesson" --grade 2 --subject ELA --topic "main idea" --duration 45
run_logged status node "$CLI" status --workspace "$WORKSPACE"
run_logged advance node "$CLI" advance --workspace "$WORKSPACE" --complete-subagents
run_logged resume node "$CLI" resume --workspace "$WORKSPACE"

mkdir -p "$WORKSPACE/cubby/outputs/lesson-packs/main-idea-lesson"
cat > "$WORKSPACE/cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md" <<'LESSON'
# Main Idea Lesson

## Objective

Students identify the main idea and one supporting detail from a short informational paragraph.
LESSON

mkdir -p "$WORKSPACE/cubby/outputs/parent-emails/example"
cat > "$WORKSPACE/cubby/outputs/parent-emails/example/email-draft.md" <<'EMAIL'
# Example Family Email

Thank you for your partnership. This fictional draft exists for release acceptance testing.
EMAIL

run_logged handoff node "$CLI" handoff --workspace "$WORKSPACE"
run_logged artifacts node "$CLI" artifacts --workspace "$WORKSPACE" --query lesson
run_logged redact node "$CLI" redact --workspace "$WORKSPACE" --source cubby/outputs/parent-emails/example/email-draft.md
run_logged export node "$CLI" export --workspace "$WORKSPACE" --source cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md
run_logged complete node "$CLI" complete --workspace "$WORKSPACE" --note "Release acceptance lesson draft reviewed."
run_logged manifest node "$CLI" manifest --workspace "$WORKSPACE"
run_logged packs node "$CLI" packs --workspace "$WORKSPACE"
run_logged upgrade node "$CLI" upgrade --workspace "$WORKSPACE" --dry-run
run_logged validate-final node "$CLI" validate --workspace "$WORKSPACE"

test -f "$WORKSPACE/AGENTS.md"
test -f "$WORKSPACE/cubby/manifest.yaml"
test -f "$WORKSPACE/cubby/exports/markdown/lesson-packs/main-idea-lesson/lesson-plan.md"
test -f "$WORKSPACE/cubby/logs/artifacts/index.yaml"
find "$WORKSPACE/cubby/logs/handoffs" -type f -name '*.handoff.md' | grep -q .
find "$WORKSPACE/cubby/logs/redactions" -type f -name 'redaction-*.yaml' | grep -q .
find "$WORKSPACE/cubby/logs/validations" -type f -name 'validation-*.yaml' | grep -q .

echo "Release acceptance passed: $WORKSPACE"
