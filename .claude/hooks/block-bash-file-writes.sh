#!/bin/bash
# PreToolUse hook — Read-only 에이전트 전용: Bash를 통한 파일 쓰기 패턴 차단
# reviewer처럼 Bash는 필요하지만 파일 수정은 안 되는 에이전트에 사용
# exit 2 = 차단, exit 0 = 허용

command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
[ "$TOOL_NAME" != "Bash" ] && exit 0
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

block() { jq -n --arg r "$1" '{decision:"block",reason:$r}'; exit 2; }

# 1. 파일 리다이렉션 차단: > 또는 >> 뒤에 /dev/{null,stderr,stdout}가 아닌 경로
#    - &>, >&, n>&m (fd 리다이렉션) 은 [^[:space:]&|;]+ 가 & 를 배제하므로 자동 제외
#    - 허용: 2>/dev/null, 1>/dev/stdout, >/dev/stderr
REDIRECT_TARGETS=$(echo "$CMD" | grep -oE '(^|[[:space:]|;])[0-9]*>+[[:space:]]*[^[:space:]&|;]+')
if [ -n "$REDIRECT_TARGETS" ]; then
  DANGEROUS=$(echo "$REDIRECT_TARGETS" | grep -vE '^[[:space:]]*[0-9]*>+[[:space:]]*/dev/(null|stderr|stdout)[[:space:]]*$')
  if [ -n "$DANGEROUS" ]; then
    block "Read-only 에이전트: 파일 리다이렉션(>, >>)은 금지입니다. 결과는 표준출력으로만 반환하세요."
  fi
fi

# 2. tee 차단
if echo "$CMD" | grep -qE '(^|[[:space:]|;])tee[[:space:]]'; then
  block "Read-only 에이전트: tee 명령으로 파일 쓰기 금지."
fi

# 3. cp / mv 차단 (플래그 포함 모든 형태)
if echo "$CMD" | grep -qE '(^|[[:space:]|;])(cp|mv)[[:space:]]'; then
  block "Read-only 에이전트: cp/mv로 파일 복사·이동 금지."
fi

# 4. touch / ln / install 차단
if echo "$CMD" | grep -qE '(^|[[:space:]|;])(touch|ln|install)[[:space:]]'; then
  block "Read-only 에이전트: touch/ln/install로 파일 생성·링크 금지."
fi

exit 0
