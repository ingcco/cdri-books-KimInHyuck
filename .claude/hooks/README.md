# .claude/hooks — 훅 스크립트 정책

Claude Code가 도구 실행/세션 이벤트 전후로 호출하는 shell 스크립트. 이벤트 바인딩은 `.claude/settings.json`의 `hooks` 매트릭스가 결정한다.

## 공통 의존성

- **jq** (필수) — `brew install jq`
  - 모든 훅 상단에 `command -v jq >/dev/null 2>&1 || exit 0` guard 포함
  - jq 없으면 훅은 **조용히 통과** (Claude 실행 차단 대신 안전측 동작)

## Exit Code 규약

| Exit | 의미                         | 사용처                                                     |
| ---- | ---------------------------- | ---------------------------------------------------------- |
| `0`  | 허용 / 정보성 stdout 전달    | 통과, `hookSpecificOutput` JSON 반환                       |
| `1`  | 일반 실패 (경고만)           | 거의 사용 안 함                                            |
| `2`  | **차단 + Claude에게 피드백** | PreToolUse에서 `{decision:"block",reason:"..."}` 후 exit 2 |

## 훅 목록

### PreToolUse (차단 가능)

- `guard-dangerous.sh` — 위험한 Bash 명령 차단 (rm -rf /, git reset --hard, main force push, curl|bash, chmod 777, sudo, find -exec/-delete 등)
- `guard-secrets.sh` — `.env`/`.pem`/`.key` 파일 수정·외부 유출·`.env.local` git add 차단
- `guard-source-hygiene.sh` — 제출 대상 소스/설정 파일(`src/**`, `eslint.config.js`, `package.json` 등, `.docs`/`.claude` 제외)에 타 프로젝트/조직명·Figma PAT 패턴이 유입되는 Write/Edit 차단

### PostToolUse / PostToolUseFailure (차단 불가, 정보 주입만)

- `after-edit.sh` — Edit/Write 후 편집 파일 prettier 포맷 + 루트 타입 체크 (`pnpm check-types`, 없으면 `npx tsc --noEmit`)
- `post-tool-failure.sh` — Bash 실패 출력에서 TS 오류 감지 시 타입 체크 명령 안내

### SessionStart / Stop / Notification

- `session-start.sh` — 세션 시작 시 브랜치·미커밋·진행 plan·dev(3000) 컨텍스트 주입
- `stop-check.sh` — 종료 전 변경 파일 기반 추가 검증 제안 (API/미들웨어→/security, 페이지·컴포넌트→/review-ui, 타입 체크)
- `notification.sh` — macOS 알림 (사용자 주의 요청 시)

### UserPromptSubmit / PreCompact / SessionEnd

- `skill-hint.sh` — 프롬프트 키워드 분석 → 관련 스킬/룰 힌트 `additionalContext`로 주입
- `precompact.sh` — 컨텍스트 압축 직전 진행 중 plan doc 최신화 알림
- `session-end.sh` — 세션 종료 시 `.playwright-tmp/` 임시 산출물 정리

### 에이전트 전용 (frontmatter `hooks:`에서 바인딩)

- `block-readonly-writes.sh` — Read-only 에이전트의 Write/Edit/NotebookEdit 차단
- `block-bash-file-writes.sh` — Read-only 에이전트의 Bash 파일 쓰기(리다이렉션/tee/cp/mv/touch) 차단
  - 두 훅은 `agents/reviewer.md` 등 Read-only 에이전트 frontmatter에서 참조 (settings.json 미등록)

## 작성 원칙

1. **최상단 jq guard** 필수
2. **`cd "$CLAUDE_PROJECT_DIR" || exit 0`** — 루트 접근 실패 시 안전측 통과
3. **JSON 출력은 `jq -Rs` 또는 `jq -n --arg`** — 수동 문자열 이스케이프 금지 (주입 방지)
4. **`set -euo pipefail` 미도입** — grep 분기(매칭 없음=exit 1)가 많아 충돌 위험
5. **무한 루프 방지** — Stop 훅은 `stop_hook_active` 체크로 재귀 종료

## 디버깅

훅이 조용히 실패하면 첫 의심 대상은 **jq 미설치**. `CLAUDE_HOOK_DEBUG=1`로 stderr 로그 확인 가능.

## 참고

- [Claude Code Hooks 공식 문서](https://code.claude.com/docs/en/hooks)
- `.claude/settings.json` — 훅 이벤트 바인딩 매트릭스
