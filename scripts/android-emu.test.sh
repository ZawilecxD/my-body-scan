#!/usr/bin/env bash
# Regression: log() must not leak into SERIAL="$(wait_for_boot)".
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STUB_DIR="$(mktemp -d)"
trap 'rm -rf "$STUB_DIR"' EXIT

cat >"$STUB_DIR/adb" <<'EOF'
#!/usr/bin/env bash
case "$1" in
  devices)
    printf 'List of devices attached\n'
    printf 'emulator-5554\tdevice\n'
    ;;
  wait-for-device)
    exit 0
    ;;
  -s)
    shift
    serial="$1"
    shift
    case "$1" in
      get-state)
        printf 'device\n'
        ;;
      shell)
        if [[ "${2:-}" == getprop && "${3:-}" == sys.boot_completed ]]; then
          printf '1\n'
        fi
        ;;
    esac
    ;;
esac
EOF
chmod +x "$STUB_DIR/adb"

# shellcheck source=android-emu.sh
source "$ROOT/scripts/android-emu.sh"
ADB="$STUB_DIR/adb"
BOOT_TIMEOUT_SEC=6

log_stdout="$(log "should not be captured" 2>/dev/null || true)"
[[ -z "$log_stdout" ]] || {
  printf 'fail: log() wrote to stdout: %q\n' "$log_stdout" >&2
  exit 1
}

serial_stdout=""
serial_stderr=""
serial_stdout="$(wait_for_boot 2>"$STUB_DIR/wait.err")"
serial_stderr="$(cat "$STUB_DIR/wait.err")"

[[ "$serial_stdout" == "emulator-5554" ]] || {
  printf 'fail: wait_for_boot stdout was %q\n' "$serial_stdout" >&2
  exit 1
}
[[ "$serial_stderr" == *"waiting for emulator to boot"* ]] || {
  printf 'fail: wait_for_boot did not log to stderr: %q\n' "$serial_stderr" >&2
  exit 1
}

printf 'ok: wait_for_boot serial is clean\n'
