#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="${1:-${TMPDIR:-/tmp}/cubby-lifecycle-demo}"
CLI="dist/cli/index.js"

rm -rf "$WORKSPACE"

node "$CLI" init --profile k5-special-ed --adapter codex --workspace "$WORKSPACE"
node "$CLI" start lesson-plan --workspace "$WORKSPACE" --title "Main idea lesson" --grade 2 --subject ELA --topic "main idea" --duration 45

mkdir -p "$WORKSPACE/cubby/outputs/lesson-packs/main-idea-lesson"
cat > "$WORKSPACE/cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md" <<'DEMO_LESSON'
# Main Idea Lesson

## Objective

Students will identify the main idea and one supporting detail from a short informational paragraph.

## Materials

* short teacher-selected informational paragraph
* highlighter or pencil
* exit ticket

## Procedure

1. Model how to read the paragraph and underline repeated ideas.
2. Ask students to name what the paragraph is mostly about.
3. Have partners identify one supporting detail.
4. Invite volunteers to share and revise the class answer.

## Assessment

Students complete one exit-ticket item naming the main idea and one detail.
DEMO_LESSON

node "$CLI" advance --workspace "$WORKSPACE" --complete-subagents --note "Demo draft created."
node "$CLI" validate --workspace "$WORKSPACE"
node "$CLI" advance --workspace "$WORKSPACE" --phase handoff --note "Validation complete for demo artifact."
node "$CLI" handoff --workspace "$WORKSPACE"
node "$CLI" export --workspace "$WORKSPACE" --source cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md
node "$CLI" artifacts --workspace "$WORKSPACE" --query main-idea
node "$CLI" manifest --workspace "$WORKSPACE"

test -f "$WORKSPACE/cubby/outputs/lesson-packs/main-idea-lesson/lesson-plan.md"
test -f "$WORKSPACE/cubby/exports/markdown/lesson-packs/main-idea-lesson/lesson-plan.md"
test -f "$WORKSPACE/cubby/logs/artifacts/index.yaml"
find "$WORKSPACE/cubby/logs/handoffs" -type f -name '*.handoff.md' | grep -q .

echo "Lifecycle demo passed."
echo "Workspace: $WORKSPACE"
