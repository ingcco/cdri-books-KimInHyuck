#!/bin/bash
# PreToolUse hook — 위험한 Bash 명령 차단
# exit 2 = 차단 (Claude에게 피드백), exit 0 = 허용

# jq 미설치 환경 가드 — jq 없으면 판정 불가, 안전측 통과
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# Bash 도구만 검사
if [ "$TOOL_NAME" != "Bash" ]; then
  exit 0
fi

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# .playwright-tmp/ 임시 파일 삭제 허용 (스크린샷·로그 정리 전용)
if echo "$COMMAND" | grep -qE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\.playwright-tmp(/\*?)?(\s|$)'; then
  exit 0
fi

# 1. 치명적 삭제 명령
if echo "$COMMAND" | grep -qE 'rm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+(/|~|\.\.|\.( |$))'; then
  echo '{"decision":"block","reason":"치명적 삭제 명령 차단: rm -rf /, ~, .., . 패턴은 실행할 수 없습니다."}'
  exit 2
fi

# 2. git reset --hard (미커밋 변경사항 손실)
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
  echo '{"decision":"block","reason":"git reset --hard 차단: 미커밋 변경사항이 손실됩니다. git stash 또는 다른 방법을 사용하세요."}'
  exit 2
fi

# 3. git push --force to main (공유 브랜치 보호)
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force.*\s+(origin\s+)?(main|master)'; then
  echo '{"decision":"block","reason":"main 브랜치 force push 차단: 공유 브랜치에 force push는 위험합니다."}'
  exit 2
fi

# 4. git clean -f (추적되지 않는 파일 삭제)
if echo "$COMMAND" | grep -qE 'git\s+clean\s+-[a-zA-Z]*f'; then
  echo '{"decision":"block","reason":"git clean -f 차단: 추적되지 않는 파일이 삭제됩니다. 파일 목록을 먼저 확인하세요."}'
  exit 2
fi

# 5. Fork bomb / 무한 루프
if echo "$COMMAND" | grep -qE ':\(\)\{.*\|.*\}|while\s+true.*do.*done.*&'; then
  echo '{"decision":"block","reason":"위험한 시스템 명령 차단: fork bomb 또는 무한 루프가 감지되었습니다."}'
  exit 2
fi

# 6. curl/wget 파이프 실행 (임의 코드 실행)
if echo "$COMMAND" | grep -qE '(curl|wget)\s+.*\|\s*(bash|sh|zsh|source)'; then
  echo '{"decision":"block","reason":"원격 스크립트 직접 실행 차단: 다운로드 후 내용을 확인한 뒤 실행하세요."}'
  exit 2
fi

# 7. dd to disk (디스크 파괴)
if echo "$COMMAND" | grep -qE 'dd\s+.*of=/dev/'; then
  echo '{"decision":"block","reason":"디스크 직접 쓰기 차단: dd of=/dev/* 패턴은 실행할 수 없습니다."}'
  exit 2
fi

# 8. chmod 777 (보안 위험)
if echo "$COMMAND" | grep -qE 'chmod\s+777'; then
  echo '{"decision":"block","reason":"chmod 777 차단: 과도한 권한 설정입니다. 최소 권한 원칙을 적용하세요."}'
  exit 2
fi

# 9. sudo (권한 상승 — 수동 실행 필요)
if echo "$COMMAND" | grep -qE '(^|\s|;|\|)\s*sudo\s+'; then
  echo '{"decision":"block","reason":"sudo 차단: 권한 상승 명령은 터미널에서 직접 실행하세요."}'
  exit 2
fi

# 10. find -exec / find -delete (대량 파일 실행·삭제)
# .playwright-tmp/ 한정 find -delete 허용
if echo "$COMMAND" | grep -qE 'find\s+\.playwright-tmp(/\*?)?\s+.*(-delete|-exec\s+rm)'; then
  exit 0
fi
if echo "$COMMAND" | grep -qE 'find\s+.*\s(-exec|-delete)\s'; then
  echo '{"decision":"block","reason":"find -exec/-delete 차단: 대량 파일 실행·삭제 패턴입니다. 영향 범위 확인 후 수동으로 실행하세요."}'
  exit 2
fi

# 11. wrapper 명령어를 통한 우회 시도
if echo "$COMMAND" | grep -qE '(^|\s|;|\|)\s*(watch|ionice|setsid)\s+'; then
  echo '{"decision":"block","reason":"프로세스 wrapper 차단: watch/ionice/setsid를 통한 명령 실행은 허용되지 않습니다."}'
  exit 2
fi

exit 0
