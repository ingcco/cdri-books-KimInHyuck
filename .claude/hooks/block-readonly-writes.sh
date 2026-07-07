#!/bin/bash
# PreToolUse hook — Read-only 에이전트 전용: Write/Edit/NotebookEdit 차단
# 에이전트 frontmatter hooks: 에 등록하여 사용
# exit 2 = 차단 (Claude에게 피드백), exit 0 = 허용

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" = "Write" ] || [ "$TOOL_NAME" = "Edit" ] || [ "$TOOL_NAME" = "NotebookEdit" ]; then
  AGENT="${CLAUDE_AGENT_NAME:-unknown}"
  jq -n --arg agent "$AGENT" \
    '{decision:"block", reason:("Read-only 에이전트(" + $agent + ")는 파일을 수정할 수 없습니다. 발견사항은 보고로만 전달하세요.")}'
  exit 2
fi

exit 0
