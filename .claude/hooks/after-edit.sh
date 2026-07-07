#!/bin/bash
# PostToolUse hook — Edit/Write 후 auto-format + 타입 체크
# 단일 패키지 앱 — 편집 파일 prettier 포맷 후 루트에서 타입 체크 1회.

# jq 미설치 환경 가드
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# .ts/.tsx 파일만 처리 (.md는 prettier/타입체크 모두 스킵 — 훅 지연 누적 방지)
if [[ "$FILE_PATH" != *.ts && "$FILE_PATH" != *.tsx ]]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Auto-format (prettier)
npx prettier --write "$FILE_PATH" 2>/dev/null

# 타입 체크 — package.json에 check-types 스크립트가 있으면 사용, 없으면 tsc 폴백
if [ -f package.json ] && grep -q '"check-types"' package.json 2>/dev/null; then
  ERRORS=$(pnpm check-types 2>&1 | grep "error TS" | head -10)
else
  ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | head -10)
fi

if [ -n "$ERRORS" ]; then
  jq -n --arg errs "타입 에러 발견:
$ERRORS" '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":$errs}}'
fi

exit 0
