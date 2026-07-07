#!/bin/bash
# PreToolUse hook — 민감 파일 보호
# Read는 허용 (디버깅에 필요), Write/Edit만 차단
# Bash에서 민감 파일 유출(curl/wget + env 파일) 차단

# jq 미설치 환경 가드 — jq 없으면 판정 불가, 안전측 통과
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

# === Write/Edit 도구: 민감 파일 수정 차단 ===
if [ "$TOOL_NAME" = "Write" ] || [ "$TOOL_NAME" = "Edit" ]; then
  FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

  # .env 파일: 직접 편집 허용 (외부 유출/git add는 아래 Bash 섹션에서 여전히 차단).
  #   - 카카오 REST 키(.env.local)의 값 변경은 명시적 작업 범위로 다루므로 Write/Edit는 통과.
  #   - 인증서/SSH 같은 진짜 키 파일은 아래에서 계속 차단.

  # 키/인증서 파일 수정 차단
  if echo "$FILE_PATH" | grep -qE '\.(pem|key|cert|p12|pfx|jks)$'; then
    echo '{"decision":"block","reason":"인증서/키 파일 수정 차단: 보안 파일은 수동으로 관리하세요."}'
    exit 2
  fi

  # SSH 설정 수정 차단
  if echo "$FILE_PATH" | grep -qE '(\.ssh/|id_rsa|id_ed25519|known_hosts|authorized_keys)'; then
    echo '{"decision":"block","reason":"SSH 파일 수정 차단: SSH 관련 파일은 수동으로 관리하세요."}'
    exit 2
  fi
fi

# === Bash 도구: 민감 데이터 유출 차단 ===
if [ "$TOOL_NAME" = "Bash" ]; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

  # curl/wget으로 env 파일 내용 전송 차단
  if echo "$COMMAND" | grep -qE '(curl|wget).*\.(env|pem|key)' || \
     echo "$COMMAND" | grep -qE 'cat\s+.*\.(env|pem|key).*\|\s*(curl|wget)'; then
    echo '{"decision":"block","reason":"민감 파일 외부 전송 차단: .env/.pem/.key 파일을 외부로 전송할 수 없습니다."}'
    exit 2
  fi

  # git add로 .env.local만 차단 (.env.development/.env.production/.env.example은 허용)
  if echo "$COMMAND" | grep -qE 'git\s+add\s+.*\.env' && \
     echo "$COMMAND" | grep -qE '\.env(\.local)?([[:space:]]|$)' && \
     ! echo "$COMMAND" | grep -qE '\.(development|production|example)'; then
    echo '{"decision":"block","reason":".env.local git add 차단: .env.local은 커밋하면 안 됩니다."}'
    exit 2
  fi

  # printenv/env 명령의 외부 전송 차단
  if echo "$COMMAND" | grep -qE '(printenv|env)\s*\|.*(curl|wget|nc|ncat)'; then
    echo '{"decision":"block","reason":"환경변수 외부 전송 차단: 환경변수를 외부로 전송할 수 없습니다."}'
    exit 2
  fi

  # 민감 파일 리다이렉션 쓰기 차단 (>, >>, heredoc)
  if echo "$COMMAND" | grep -qE '>{1,2}[[:space:]]*[^[:space:]]*\.(env|pem|key|cert|p12|pfx|jks)([[:space:]]|$)'; then
    echo '{"decision":"block","reason":"민감 파일 리다이렉션 쓰기 차단: >, >>로 .env/.pem/.key 파일에 직접 쓸 수 없습니다."}'
    exit 2
  fi

  # cat heredoc으로 민감 파일 쓰기 차단 (cat << EOF > .env)
  if echo "$COMMAND" | grep -qE 'cat\s+<<[^\n]*>[[:space:]]*[^[:space:]]*\.(env|pem|key|cert|p12|pfx|jks)'; then
    echo '{"decision":"block","reason":"민감 파일 heredoc 쓰기 차단: cat <<EOF > .env 패턴은 허용되지 않습니다."}'
    exit 2
  fi

  # tee로 민감 파일 쓰기 차단
  if echo "$COMMAND" | grep -qE 'tee\s+.*\.(env|pem|key|cert|p12|pfx|jks)'; then
    echo '{"decision":"block","reason":"민감 파일 tee 쓰기 차단: tee로 .env/.pem/.key 파일에 쓸 수 없습니다."}'
    exit 2
  fi
fi

exit 0
