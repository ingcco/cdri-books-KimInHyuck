#!/bin/bash
# PreCompact hook — 컨텍스트 압축 직전 plan doc 최신화 상태 알림

command -v jq >/dev/null 2>&1 || exit 0

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# 진행 중인 plan 문서 탐색 (.docs/plans/ 하위, completed/ 제외)
ACTIVE_PLANS=$(find . -path "*/\.docs/plans/*.md" \
  ! -path "*/completed/*" \
  ! -name "_Template.md" \
  2>/dev/null | head -5)

if [ -z "$ACTIVE_PLANS" ]; then
  exit 0
fi

PLAN_LIST=$(echo "$ACTIVE_PLANS" | sed 's|^\./||' | tr '\n' ', ' | sed 's/,$//')

MSG="📋 컨텍스트 압축 전 확인: 진행 중인 plan doc이 있습니다 (${PLAN_LIST}). 체크리스트와 발견 사항이 최신 상태인지 확인하세요. plan doc는 압축 후 새 세션의 유일한 컨텍스트입니다."

echo "{\"decision\": \"approve\", \"reason\": $(echo "$MSG" | jq -Rs .)}"
exit 0
