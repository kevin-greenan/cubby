#!/usr/bin/env bash
set -euo pipefail

PACK_ROOT="${TMPDIR:-/tmp}/cubby-package-smoke"
INSTALL_ROOT="$PACK_ROOT/install"
RUN_ROOT="$PACK_ROOT/run"
WORKSPACE="$PACK_ROOT/workspace"
HELP_LOG="$PACK_ROOT/help.log"
INIT_LOG="$PACK_ROOT/init.log"
VALIDATE_LOG="$PACK_ROOT/validate.log"

rm -rf "$PACK_ROOT"
mkdir -p "$INSTALL_ROOT" "$RUN_ROOT"

show_logs() {
  local status=$?
  if [[ "$status" -ne 0 ]]; then
    for log in "$HELP_LOG" "$INIT_LOG" "$VALIDATE_LOG"; do
      if [[ -f "$log" ]]; then
        echo "--- ${log##*/} ---"
        cat "$log"
      fi
    done
  fi
  exit "$status"
}
trap show_logs EXIT

npm pack --dry-run --json > "$PACK_ROOT/pack-dry-run.json"
npm pack --pack-destination "$PACK_ROOT" --json > "$PACK_ROOT/pack.json"
PACKAGE_TARBALL="$(node -e "const fs = require('fs'); const pack = JSON.parse(fs.readFileSync(process.argv[1], 'utf8')); console.log(pack[0].filename);" "$PACK_ROOT/pack.json")"

npm install --prefix "$INSTALL_ROOT" "$PACK_ROOT/$PACKAGE_TARBALL"
"$INSTALL_ROOT/node_modules/.bin/cubby" help > "$HELP_LOG"
(
  cd "$RUN_ROOT"
  "$INSTALL_ROOT/node_modules/.bin/cubby" init --profile k5-special-ed --adapter codex --workspace "$WORKSPACE" > "$INIT_LOG"
  "$INSTALL_ROOT/node_modules/.bin/cubby" validate --workspace "$WORKSPACE" > "$VALIDATE_LOG"
)

test -f "$WORKSPACE/AGENTS.md"
test -f "$WORKSPACE/cubby/manifest.yaml"

echo "Package smoke passed: $PACKAGE_TARBALL"
