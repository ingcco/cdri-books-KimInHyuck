#!/bin/bash
# Notification hook — Claude Code가 사용자 주의를 요청할 때 macOS 알림

# jq 미설치 환경 가드
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "작업이 완료되었습니다"')

NOTIF_MSG="$MESSAGE" osascript - 2>/dev/null <<'APPLESCRIPT'
set msg to system attribute "NOTIF_MSG"
display notification msg with title "Claude Code" sound name "Glass"
APPLESCRIPT

exit 0
