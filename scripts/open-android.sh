#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${CAPACITOR_ANDROID_STUDIO_PATH:-}" ]]; then
  candidates=(
    "$HOME/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh"
    "/usr/local/android-studio/bin/studio.sh"
    "/opt/android-studio/bin/studio.sh"
    "$HOME/android-studio/bin/studio.sh"
  )

  for candidate in "${candidates[@]}"; do
    if [[ -x "$candidate" ]]; then
      export CAPACITOR_ANDROID_STUDIO_PATH="$candidate"
      break
    fi
  done
fi

if [[ -z "${CAPACITOR_ANDROID_STUDIO_PATH:-}" || ! -x "$CAPACITOR_ANDROID_STUDIO_PATH" ]]; then
  echo "Android Studio not found."
  echo "Set CAPACITOR_ANDROID_STUDIO_PATH to your studio.sh path, for example:"
  echo '  export CAPACITOR_ANDROID_STUDIO_PATH="$HOME/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh"'
  exit 1
fi

exec npx cap open android
