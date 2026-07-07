#!/bin/bash
# SessionStart hook — 세션 시작 시 프로젝트 컨텍스트 복원
# 현재 브랜치, 미커밋 변경, 진행 중인 plan, dev 서버 상태를 알려준다.
# 개인 과제 레포 — main 직접 작업 허용(브랜치 경고 없음).

# jq 미설치 환경 가드 (JSON 출력에 필요)
command -v jq >/dev/null 2>&1 || exit 0

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

CONTEXT=""

# 1. 현재 브랜치
BRANCH=$(git branch --show-current 2>/dev/null)
if [ -n "$BRANCH" ]; then
  CONTEXT+="브랜치: $BRANCH"
fi

# 2. 미커밋 변경사항
CHANGES=$(git status --porcelain 2>/dev/null | head -10)
CHANGE_COUNT=$(echo "$CHANGES" | grep -c '[^ ]' 2>/dev/null)
if [ "$CHANGE_COUNT" -gt 0 ]; then
  CONTEXT+="\n미커밋 변경: ${CHANGE_COUNT}개 파일"
fi

# 3. 진행 중인 plan 문서 (.docs/plans/, completed/ 제외)
PLANS=$(find . -path '*/.docs/plans/*.md' ! -path '*/completed/*' ! -name '_Template.md' ! -name 'README.md' 2>/dev/null)
if [ -n "$PLANS" ]; then
  PLAN_LIST=$(echo "$PLANS" | sed 's|^\./||' | tr '\n' ', ' | sed 's/,$//')
  CONTEXT+="\n📋 진행 중 plan: $PLAN_LIST"
fi

# 4. dev 서버 상태 (포트 3000)
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null | grep -q "200"; then
  CONTEXT+="\n🟢 dev 서버 실행 중: 3000"
fi

# 컨텍스트가 있으면 출력
if [ -n "$CONTEXT" ]; then
  ESCAPED=$(echo -e "$CONTEXT" | jq -Rs .)
  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": $ESCAPED
  }
}
EOF
fi

exit 0
