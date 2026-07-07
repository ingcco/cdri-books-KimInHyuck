#!/bin/bash
# Stop hook — 변경 파일 기반으로 추가 검증 필요 여부 판단
# 코드 변경이 있을 때만 동작, 없으면 무시

# jq 미설치 환경 가드
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)

# stop_hook_active일 때는 무한 루프 방지
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

# 변경된 파일 목록 (staged + unstaged)
CHANGED=$(git diff --name-only 2>/dev/null; git diff --cached --name-only 2>/dev/null)

# 변경 파일이 없으면 종료
if [ -z "$CHANGED" ]; then
  exit 0
fi

SUGGESTIONS=""

# === 보안 검증 필요 여부 (카카오 프록시 Route Handler / 미들웨어) ===
if echo "$CHANGED" | grep -qE 'app/api/.*/route\.ts' || echo "$CHANGED" | grep -qE '(^|/)middleware\.ts'; then
  SUGGESTIONS+="🔒 API Route/미들웨어 변경 감지 → /security 실행 권장\n"
fi

# === UI 검증 필요 여부 (페이지·컴포넌트) ===
if echo "$CHANGED" | grep -qE '(app|components)/.*\.tsx$'; then
  SUGGESTIONS+="🎨 UI/페이지 변경 감지 → /review-ui 실행 권장\n"
fi

# === 타입 체크 필요 여부 ===
if echo "$CHANGED" | grep -qE '\.(ts|tsx)$'; then
  SUGGESTIONS+="🔍 타입 체크 + 린트 실행 확인\n"
fi

# 제안사항이 있으면 출력 (Stop 이벤트는 systemMessage만 허용 — decision:approve는 미지원)
if [ -n "$SUGGESTIONS" ]; then
  ESCAPED=$(echo -e "$SUGGESTIONS" | jq -Rs .)
  cat <<EOF
{
  "systemMessage": $ESCAPED
}
EOF
fi

exit 0
