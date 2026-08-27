#!/usr/bin/env bash
#
# Build, start the server, wait until it actually answers, run validate, and
# always stop the server again.
#
# Two hazards this is shaped around:
#
#   1. A fixed `sleep` before validating is a guess. On a loaded machine the
#      server is not listening yet and every validate check fails with
#      ECONNREFUSED; the rest of the time it is seconds of nothing. So
#      readiness is polled instead.
#
#   2. `$!` after `npm start` is the PID of the npm WRAPPER, not of the `node`
#      process npm spawns. Killing the wrapper can leave the server holding
#      the port, so the next run dies with EADDRINUSE. Starting node directly
#      makes `$!` the process that owns the port.
#
# Readiness is polled against /api/element, an endpoint that is already in the
# OpenAPI definition and already exercised by validate.ts. Deliberately NOT a
# new /health route: an endpoint the spec does not describe is exactly the
# drift this repo already carries for /debug.

set -uo pipefail

cd "$(dirname "$0")/.."

PORT="${PORT:-8902}"
HOST="${HOST:-localhost}"
READY_URL="http://${HOST}:${PORT}/api/element"
TIMEOUT_SECS="${VALIDATE_TIMEOUT_SECS:-30}"

npm run build || exit $?

# Refuse to start if the port is ALREADY answering.
#
# Without this the script cheerfully validates against someone else's server:
# our node exits at once with EADDRINUSE, the readiness probe succeeds on its
# first attempt because the FOREIGN process answers, and validate reports full
# marks for a server this script never started and cannot vouch for. Exit 0,
# nothing of ours tested.
if curl -fsS --connect-timeout 2 --max-time 2 -o /dev/null "$READY_URL" 2>/dev/null; then
  echo "something is already listening on ${HOST}:${PORT} — refusing to run" >&2
  echo "validate would have tested THAT server, not the one this script starts" >&2
  exit 1
fi

node dist/src/server.js &
SERVER_PID=$!

# Always stop the server, whatever happens next — including Ctrl-C.
cleanup() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Liveness is checked BEFORE the probe, and that order is the whole point.
#
# Probing first would be the same bug as the pre-flight check above, in
# miniature: if ANYTHING answers, the loop exits on its first iteration and
# the dead-child branch is never reached — so a server that died on startup
# would be indistinguishable from one that came up.
#
# --max-time also matters: a process can hold the port and accept connections
# without ever replying, and an untimed curl then waits forever — the probe
# hangs instead of reporting "not ready".
deadline=$(( SECONDS + TIMEOUT_SECS ))
while true; do
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "server exited before it began listening" >&2
    exit 1
  fi

  if curl -fsS --connect-timeout 2 --max-time 2 -o /dev/null "$READY_URL" 2>/dev/null; then
    break
  fi

  if (( SECONDS >= deadline )); then
    echo "server did not answer ${READY_URL} within ${TIMEOUT_SECS}s" >&2
    exit 1
  fi
  sleep 0.1
done

npm run validate
