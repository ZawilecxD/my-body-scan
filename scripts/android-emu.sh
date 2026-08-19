#!/usr/bin/env bash
# Boot Pixel_8 (if needed), ensure Expo Go SDK 57, then start Metro against the emulator.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
AVD_NAME="${AVD_NAME:-Pixel_8}"
EXPO_GO_SDK="${EXPO_GO_SDK:-57}"
EXPO_GO_PACKAGE="host.exp.exponent"
APK_CACHE="${HOME}/.expo/android-apk-cache"
BOOT_TIMEOUT_SEC="${BOOT_TIMEOUT_SEC:-180}"

EMULATOR="${ANDROID_HOME}/emulator/emulator"
ADB="${ANDROID_HOME}/platform-tools/adb"

log() {
  printf 'android-emu: %s\n' "$*"
}

die() {
  printf 'android-emu: %s\n' "$*" >&2
  exit 1
}

require_tools() {
  [[ -x "$EMULATOR" ]] || die "emulator not found at $EMULATOR (set ANDROID_HOME)"
  [[ -x "$ADB" ]] || die "adb not found at $ADB (set ANDROID_HOME)"
}

emulator_serial() {
  "$ADB" devices | awk '/^emulator-/{ if ($2 == "device" || $2 == "offline") print $1 }' | head -n 1
}

has_ready_emulator() {
  local serial
  serial="$(emulator_serial || true)"
  [[ -n "$serial" ]] && "$ADB" devices | awk -v s="$serial" '$1 == s && $2 == "device" { found=1 } END { exit found ? 0 : 1 }'
}

wait_for_boot() {
  local serial=""
  local elapsed=0
  log "waiting for emulator to boot (timeout ${BOOT_TIMEOUT_SEC}s)"
  "$ADB" wait-for-device
  while (( elapsed < BOOT_TIMEOUT_SEC )); do
    serial="$(emulator_serial || true)"
    if [[ -n "$serial" ]]; then
      local state boot
      state="$("$ADB" -s "$serial" get-state 2>/dev/null | tr -d '\r' || true)"
      boot="$("$ADB" -s "$serial" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
      if [[ "$state" == "device" && "$boot" == "1" ]]; then
        printf '%s\n' "$serial"
        return 0
      fi
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  die "emulator did not finish booting within ${BOOT_TIMEOUT_SEC}s"
}

expo_go_version() {
  local serial="$1"
  "$ADB" -s "$serial" shell dumpsys package "$EXPO_GO_PACKAGE" 2>/dev/null \
    | tr -d '\r' \
    | awk -F= '/versionName/ { gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit }'
}

needs_expo_go() {
  local serial="$1"
  local version
  version="$(expo_go_version "$serial" || true)"
  [[ -z "$version" || "$version" != "${EXPO_GO_SDK}"* ]]
}

find_expo_go_apk() {
  local match=""
  shopt -s nullglob
  local candidates=("$APK_CACHE"/Expo-Go-"${EXPO_GO_SDK}"*.apk)
  shopt -u nullglob
  if (( ${#candidates[@]} > 0 )); then
    match="$(ls -1t "${candidates[@]}" | head -n 1)"
  fi
  [[ -n "$match" ]] && printf '%s\n' "$match"
}

ensure_expo_go() {
  local serial="$1"
  if ! needs_expo_go "$serial"; then
    log "Expo Go SDK ${EXPO_GO_SDK} already installed ($(expo_go_version "$serial"))"
    return 0
  fi

  local apk
  apk="$(find_expo_go_apk || true)"
  if [[ -z "$apk" ]]; then
    log "downloading Expo Go SDK ${EXPO_GO_SDK}"
    mkdir -p "$APK_CACHE"
    (
      cd "$APK_CACHE"
      npx --yes expo-go download android "$EXPO_GO_SDK"
    )
    apk="$(find_expo_go_apk || true)"
  fi
  [[ -n "$apk" && -f "$apk" ]] || die "Expo Go SDK ${EXPO_GO_SDK} APK not found in $APK_CACHE"

  log "installing $(basename "$apk")"
  "$ADB" -s "$serial" install -r -d "$apk"
}

start_emulator_if_needed() {
  if has_ready_emulator; then
    log "reusing running emulator $(emulator_serial)"
    return 0
  fi
  if [[ -n "$(emulator_serial || true)" ]]; then
    log "emulator already starting"
    return 0
  fi
  log "starting AVD ${AVD_NAME}"
  "$EMULATOR" -avd "$AVD_NAME" -gpu host >/tmp/android-emu-"${AVD_NAME}".log 2>&1 &
  disown
}

remove_stray_apks() {
  shopt -s nullglob
  local stray=("$ROOT"/Expo-Go-*.apk)
  shopt -u nullglob
  if (( ${#stray[@]} > 0 )); then
    log "removing stray APKs from the project directory"
    rm -f "${stray[@]}"
  fi
}

require_tools
remove_stray_apks
start_emulator_if_needed
SERIAL="$(wait_for_boot)"
log "emulator ready ($SERIAL)"
ensure_expo_go "$SERIAL"
export ANDROID_SERIAL="$SERIAL"
exec npx expo start --android
