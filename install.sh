#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ID="window-margins"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_SRC="$REPO_DIR/$SCRIPT_ID"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"
SCRIPTS_DIR="$DATA_DIR/kwin/scripts"
KWINRC="$HOME/.config/kwinrc"

mkdir -p "$SCRIPTS_DIR"
cp -a "$PKG_SRC" "$SCRIPTS_DIR/"

if command -v kwriteconfig6 >/dev/null 2>&1; then
    kwriteconfig6 --file kwinrc --group Plugins --key "${SCRIPT_ID}Enabled" true
elif command -v kwriteconfig5 >/dev/null 2>&1; then
    kwriteconfig5 --file kwinrc --group Plugins --key "${SCRIPT_ID}Enabled" true
else
    touch "$KWINRC"
    if ! grep -q '^\[Plugins\]' "$KWINRC"; then
        printf '\n[Plugins]\n%sEnabled=true\n' "$SCRIPT_ID" >> "$KWINRC"
    elif ! grep -q "^${SCRIPT_ID}Enabled=" "$KWINRC"; then
        sed -i "/^\[Plugins\]/a ${SCRIPT_ID}Enabled=true" "$KWINRC"
    fi
fi

if command -v qdbus6 >/dev/null 2>&1; then
    qdbus6 org.kde.KWin /KWin reconfigure
elif command -v qdbus >/dev/null 2>&1; then
    qdbus org.kde.KWin /KWin reconfigure
else
    gdbus call --session --dest org.kde.KWin --object-path /KWin --method org.kde.KWin.reconfigure
fi

sleep 1
if command -v qdbus6 >/dev/null 2>&1; then
    qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "$SCRIPT_ID"
else
    gdbus call --session --dest org.kde.KWin --object-path /Scripting --method org.kde.kwin.Scripting.isScriptLoaded "$SCRIPT_ID"
fi

echo "Window margins script installed: $SCRIPTS_DIR/$SCRIPT_ID"
