#!/bin/bash
# Fetch text from argument or fallback to clipboard
TEXT="${1:-$(wl-paste 2>/dev/null)}"
[ -z "$TEXT" ] && exit 0

TOKEN_FILE="${XDG_RUNTIME_DIR:-/tmp}/autotyper.token"
[ -f "$TOKEN_FILE" ] && TOKEN=$(cat "$TOKEN_FILE") || TOKEN=""

# Execute D-Bus call in background to prevent blocking
gdbus call --session \
    --dest org.gnome.Shell \
    --object-path /org/gnome/Shell/Extensions/AutoTyper \
    --method org.gnome.Shell.Extensions.AutoTyper.TypeText "$TOKEN" "$TEXT" >/dev/null 2>&1 &
