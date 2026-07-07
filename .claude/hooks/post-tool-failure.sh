#!/bin/bash
# PostToolUseFailure hook — Bash 도구 실패 시 타입체크/린트 제안
# (PostToolUse는 성공 시에만 발화하므로 실패 전용 PostToolUseFailure에 바인딩 — settings.json)

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)

# 실패 이벤트지만 방어적으로 성공 케이스는 통과 (입력 shape 호환)
IS_ERROR=$(echo "$INPUT" | jq -r '.tool_response.is_error // false')
EXIT_CODE=$(echo "$INPUT" | jq -r '.tool_response.exit_code // 0')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // ""')

if [ "$IS_ERROR" != "true" ] && [ "$EXIT_CODE" = "0" ]; then
  exit 0
fi

# Bash 실패 — 내용에서 TypeScript 오류 힌트 확인
if [ "$TOOL_NAME" = "Bash" ]; then
  CONTENT=$(echo "$INPUT" | jq -r '.tool_response.content // ""')
  # TS 컴파일 오류나 빌드 실패일 때만 제안
  if echo "$CONTENT" | grep -qE "error TS|Type error|Cannot find|tsc"; then
    jq -n --arg msg "타입 체크 실패 감지. 다음으로 정확한 오류 위치를 확인하세요:
- pnpm check-types (스크립트 없으면 npx tsc --noEmit)" \
      '{"hookSpecificOutput":{"hookEventName":"PostToolUseFailure","additionalContext":$msg}}'
  fi
fi

exit 0
