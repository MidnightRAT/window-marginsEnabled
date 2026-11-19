#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ID="window-margins"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"
KWINRC="$HOME/.config/kwinrc"

rm -rf "$DATA_DIR/kwin/scripts/$SCRIPT_ID"

if command -v kwriteconfig6 >/dev/null 2>&1; then
    kwriteconfig6 --file kwinrc --group Plugins --key "${SCRIPT_ID}Enabled" false
elif command -v kwriteconfig5 >/dev/null 2>&1; then
    kwriteconfig5 --file kwinrc --group Plugins --key "${SCRIPT_ID}Enabled" false
else
    sed -i "/^${SCRIPT_ID}Enabled=/d" "$KWINRC"
fi

if command -v qdbus-qt6 >/dev/null 2>&1; then
    qdbus-qt6 org.kde.KWin /KWin reconfigure
elif command -v qdbus >/dev/null 2>&1; then
    qdbus org.kde.KWin /KWin reconfigure
elif command -v qdbus6 >/dev/null 2>&1; then
    qdbus6 org.kde.KWin /KWin reconfigure
else
    gdbus call --session --dest org.kde.KWin --object-path /KWin --method org.kde.KWin.reconfigure
fi

# Flipping the plugin flag does not unload an already running script in
# KWin: without this call the old code keeps working after the files
# have been removed.
if command -v qdbus-qt6 >/dev/null 2>&1; then
    qdbus-qt6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$SCRIPT_ID" >/dev/null 2>&1 || true
elif command -v qdbus >/dev/null 2>&1; then
    qdbus org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$SCRIPT_ID" >/dev/null 2>&1 || true
elif command -v qdbus6 >/dev/null 2>&1; then
    qdbus6 org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$SCRIPT_ID" >/dev/null 2>&1 || true
fi

echo "Window margins script removed."
