#!/bin/bash
# PreToolUse hook — 제출용 소스/설정 파일에 타 프로젝트명·비밀토큰 패턴 유입 차단
# .docs/.claude(내부 작업 문서)는 대상 아님 — 실제 제출되는 코드만 검사

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then
  exit 0
fi

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 제출 대상 소스/설정 파일만 검사 (.docs, .claude, node_modules 등은 제외)
case "$FILE_PATH" in
  */.docs/*|*/.claude/*|*/node_modules/*) exit 0 ;;
esac

case "$FILE_PATH" in
  */src/*|*eslint.config.*|*vite.config.*|*tailwind.config.*|*package.json|*.env*|*index.html|*tsconfig*.json) ;;
  *) exit 0 ;;
esac

NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // .tool_input.new_string // empty')
[ -z "$NEW_CONTENT" ] && exit 0

# 타 프로젝트/조직명 하드코딩 차단
if echo "$NEW_CONTENT" | grep -qE 'web-andrsen|vxt-fashion-admin|klleon|hururup'; then
  echo '{"decision":"block","reason":"타 프로젝트/조직명이 제출 소스에 포함됩니다. 참고 근거는 .docs/plans에만 남기고 src/설정 파일에는 쓰지 마세요."}'
  exit 2
fi

# Figma Personal Access Token 패턴 차단
if echo "$NEW_CONTENT" | grep -qE 'figd_[A-Za-z0-9_-]+'; then
  echo '{"decision":"block","reason":"Figma PAT로 보이는 문자열이 포함됩니다. 토큰은 어떤 파일에도 저장하지 마세요."}'
  exit 2
fi

exit 0
