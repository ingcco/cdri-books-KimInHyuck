#!/bin/bash
# /ship 세션 리포트 생성 래퍼.
# 사용법: bash session-report.sh [session_id]
# CLAUDE_SESSION_ID 환경변수 우선, 없으면 현재 프로젝트의 최신 JSONL.

SESSION_ID="${1:-${CLAUDE_SESSION_ID:-}}"

# 현재 작업 디렉토리의 Claude Code 세션 로그 경로 계산
# 경로 인코딩: / → - 치환 + 앞에 - 추가
PROJECT_SLUG=$(echo -n "$(pwd)" | sed 's|/|-|g')
SESSIONS_DIR="$HOME/.claude/projects/${PROJECT_SLUG}"

if [ ! -d "$SESSIONS_DIR" ]; then
  echo "⚠️ 세션 디렉토리 없음: $SESSIONS_DIR" >&2
  exit 0
fi

if [ -n "$SESSION_ID" ] && [ -f "$SESSIONS_DIR/${SESSION_ID}.jsonl" ]; then
  JSONL="$SESSIONS_DIR/${SESSION_ID}.jsonl"
else
  JSONL=$(ls -t "$SESSIONS_DIR"/*.jsonl 2>/dev/null | head -1)
fi

if [ -z "$JSONL" ] || [ ! -f "$JSONL" ]; then
  echo "⚠️ 세션 JSONL을 찾을 수 없음." >&2
  exit 0
fi

# python3 필수
if ! command -v python3 >/dev/null 2>&1; then
  echo "⚠️ python3 미설치 — 세션 리포트 스킵." >&2
  exit 0
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/session-report.py" "$JSONL"
