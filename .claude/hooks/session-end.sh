#!/bin/bash
# SessionEnd hook — 세션 종료 시 런타임 임시 파일 정리 (비대화형 housekeeping)
# Stop은 매 턴 발화하므로 cleanup엔 부적합 — SessionEnd는 세션당 1회만 발화.
# settings.json의 SessionEnd 이벤트에 바인딩.

# 브라우저 검증 임시 산출물 정리 (/review-ui, /ship 스킬이 생성)
for dir in .playwright-tmp; do
  if [ -d "$dir" ]; then
    rm -rf "${dir:?}/"* 2>/dev/null
  fi
done

exit 0
