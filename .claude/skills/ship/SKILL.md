---
name: ship
description: 브라우저 검증 + 커밋 + 세션 리포트 자동화 스킬. 린트/타입체크 → 브라우저 확인 → 커밋 → 세션 리포트를 순차 실행합니다. 트리거 - "/ship"
effort: low
---

# /ship — 브라우저 검증 + 커밋 + 세션 리포트

변경된 코드의 브라우저 동작을 확인하고 커밋한 뒤, 세션에서 사용한 스킬/토큰/중복/미사용을 집계한 리포트를 생성하는 자동화 스킬.

> 코드 컨벤션 리뷰는 `/review`에서 수행. `/ship`은 린트/타입체크 + 브라우저 검증 + 커밋 + 리포트에 집중.

## 트리거

사용자가 `/ship` 또는 `/ship [커밋 메시지]`를 입력하면 실행.

## 실행 절차

다음을 순서대로 실행. 각 단계 실패 시 해당 에러를 수정하고 재실행.

### 1. 변경 범위 파악 + 스테이징

```bash
git status
git diff --stat
```

단독 앱이므로 커밋 대상은 이번 세션이 실제로 변경한 파일만 명시 staging한다.

1. **`git add` 전에 이미 staged된 파일 확인**:
   ```bash
   git diff --cached --name-only   # 비어 있어야 정상. 출력 있으면 이전 세션이 남긴 잔여 stage
   ```
2. 출력이 있으면 → 각 파일이 **이번 작업 산출물인지** 대화 맥락으로 판별. 아니면 사용자에게 보고 후 커밋 동승 여부 확인
3. **이번 작업이 실제 변경한 파일만 명시 staging** (디렉토리 통째 add 금지):
   ```bash
   git add {이번 세션 변경 파일 목록}
   ```
4. **커밋 직전 `git diff --cached --name-only` 재확인** — staged 목록이 이번 작업 범위와 정확히 일치하는지 확인 후 커밋

### 1.5. 테스트 영향 감지 (F-8 게이트)

커밋 직전, 변경된 소스가 요구하는 테스트 레벨이 **함께 변경됐는지** 점검한다. 전 파일에 테스트를 강제하는 게 아니라(리스크 원칙), 리스크 계층을 건드렸는데 대응 테스트가 diff에 없을 때만 확인을 요청하는 **리마인드**다.

```bash
node .claude/skills/ship/scripts/test-impact.mjs
```

- `[test-impact] OK` (exit 0) → 통과, 다음 단계로
- `[test-impact] REVIEW` (exit 1) → **강제 중단 아님**. 스크립트가 지목한 소스·레벨을 사용자에게 제시하고 *"테스트 갱신이 필요한 변경인가, 의도된 것인가"* 를 확인한다. 의도된 변경이면 그대로 진행, 갱신이 필요하면 커밋 전에 테스트를 반영.

**경로 → 레벨 매핑** (SOT: `.docs/spec/requirements.md` 레벨 태그 u/i/e):

| 변경 소스 | 요구 레벨 |
|---|---|
| `src/lib/api/*/api.ts`·`api.queries.ts` | integration |
| `use*.ts`(훅)·`src/utils/**`·`lib/favorites/favorites.ts`·`lib/api/shared/*.ts` | unit |
| `**/*.tsx`(페이지·컴포넌트·레이아웃·라우터) | e2e |
| `*.style.ts`·`constants/`·`*.interface.ts`·`assets/` | skip |

### 2. 테스트 (해당 시)

1.5에서 REVIEW가 떴거나 테스트 파일/테스트 대상 로직이 변경됐으면 해당 레벨을 실행:

```bash
pnpm test:unit          # 순수 함수·훅
pnpm test:integration   # API 계층 + React Query (MSW)
pnpm test:e2e           # Playwright 여정·시각정합
```

### 3. 린트 + 타입체크

```bash
pnpm lint
pnpm typecheck
```

에러가 있으면 수정 후 재실행 (최대 3회).

> 스크립트명은 프로젝트 `package.json` 기준으로 확인 후 사용.

### 4. 네비게이션 연결 검증 (해당 시)

레이아웃/네비게이션 컴포넌트 또는 페이지 라우트 등록(`src/main.tsx`) 변경 시:

1. 네비게이션 컴포넌트(`NavLink`/`Link`)에서 `to=` 값 추출 (외부 링크 `href=`는 대상 아님 — 예: 구매하기 버튼의 카카오 book url)
2. 각 `to` 값에 대응하는 라우트가 `src/main.tsx`의 react-router 설정에 실제로 등록돼 있는지 확인
3. **누락된 라우트 발견 시 → 커밋 차단** + 사용자에게 보고

```bash
# 네비게이션에서 to= 추출 후 라우터 설정에 등록돼 있는지 확인
grep -roh 'to="[^"]*"' src/ | sort -u
```

### 5. 브라우저 검증 (해당 시)

> `/review-ui`를 이미 실행한 세션이라면 이 단계는 **건너뜀** — 중복 실행 방지.

페이지/컴포넌트 변경 시 (`/review-ui` 미실행인 경우만):

**dev 서버 확인:**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

서버 미실행 시 `pnpm dev`로 기동 후 진행.

**Playwright CLI — Bash로 직접 실행, 브라우저 창 열기 금지**

> MCP(Playwright MCP)는 사용하지 않는다. Bash 도구로 `npx playwright` CLI를 직접 실행하고, 스크린샷은 Read 도구로 이미지 확인.

```bash
# 사전 조건 (최초 1회, playwright 미설치 시)
pnpm add -D playwright && npx playwright install chromium

# 스크린샷 + 콘솔 에러 동시 캡처 (headless, 브라우저 창 없음)
mkdir -p .playwright-tmp
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3000/{route}', { waitUntil: 'networkidle', timeout: 10000 });
  await page.screenshot({ path: '.playwright-tmp/snap.png', fullPage: true });
  await browser.close();
  if (errors.length) { console.error(JSON.stringify(errors)); process.exit(1); }
  else console.log('OK');
})().catch(e => { console.error(e.message); process.exit(1); });
"
```

스크린샷 확인:
```
Read(.playwright-tmp/snap.png)  ← 이미지로 렌더 상태 확인
```

- 콘솔 에러 발견 → 수정 후 재실행 (최대 3회)
- 시각적 UI 정합성 검증은 `/review-ui` 전담 — 이 단계는 렌더 에러·JS 오류만

**Playwright 설치 불가 시 fallback:**

```bash
# SSR 콘텐츠 존재 여부만 확인 (콘솔 에러 미캡처)
curl -s http://localhost:3000/{route} | grep -oE '({기대 키워드 1}|{기대 키워드 2})' | sort -u
```

실패 시 자동 진행 금지 — 사용자에게 보고 후 위임.

### 6. 커밋

모든 검증 통과 후:

- 변경 파일을 staging (Step 1에서 명시 staging한 목록)
- 커밋 메시지가 인자로 주어졌으면 그대로 사용
- 없으면 변경 내용 분석하여 Conventional Commits 형식으로 생성
- **설명 없이 바로 커밋 실행**

**커밋 메시지 컨벤션:**

| prefix  | 용도                                       | 예시                                |
| ------- | ------------------------------------------ | ----------------------------------- |
| `feat`  | 새 기능                                    | `feat: 도서 검색 기능 추가`         |
| `fix`   | 버그 수정                                  | `fix: 검색 결과 페이지네이션 오류`  |
| `chore` | 리팩토링, 스타일, 설정, 문서, 스킬 등 기타 | `chore: ESLint 설정 업데이트`       |
| `ci`    | CI/CD 파이프라인, 배포 설정                | `ci: Vercel 배포 설정 추가`         |

형식: `{prefix}: {한글 설명}` — 본문은 필요 시만 추가.

### 7. Playwright 임시 파일 정리

브라우저 검증에서 생성된 스크린샷, 콘솔 로그 등을 삭제:

```bash
rm -rf .playwright-tmp/*
```

### 8. Planning 문서 완료 처리 (해당 시)

진행 중인 플래닝 문서 검색:

```bash
find .docs/plans -maxdepth 1 -name '*.md' ! -name '_Template.md' ! -name '*.backlog.md'
```

체크리스트가 **전부 완료** 상태이면:

```bash
# 문서 상태를 완료로 변경
# > 상태: 🔵 진행 중  →  > 상태: ✅ 완료

# plan + 짝 backlog 파일을 함께 이동
git mv .docs/plans/{작업명}.md .docs/plans/completed/{작업명}.md
[ -f ".docs/plans/{작업명}.backlog.md" ] && \
  git mv .docs/plans/{작업명}.backlog.md .docs/plans/completed/{작업명}.backlog.md
```

- 체크리스트에 미완료 항목이 있으면 이동하지 않음 (아직 진행 중)
- 이동된 파일은 커밋에 포함
- backlog 파일은 plan과 짝으로 이동(존재 시)

### 8.5. Backlog 점검 (해당 시)

방금 완료된 plan **또는 본 ship 사이클에서 다룬 진행 중 plan**의 짝 backlog 파일(`{작업명}.backlog.md`)에서 `💡 컨벤션 개선 후보`와 `⏳ 별도 plan 후보` 절을 추출해 사용자에게 제시.

```bash
for backlog in $(find .docs/plans -name '*.backlog.md'); do
  echo "=== $backlog ==="
  awk '/^## 💡 컨벤션 개선 후보/,/^## /' "$backlog"
  awk '/^## ⏳ 별도 plan 후보/,/^## /' "$backlog"
done
```

추출 결과를 사용자에게 다음 포맷으로 출력:

```
📤 Backlog 점검 — {작업명}.backlog.md

💡 컨벤션 개선 후보 N건:
  1. [내용] → 제안 SOT 위치 (.claude/rules/*.md 또는 CLAUDE.md)

🔀 별도 plan 후보 N건 (off-topic — 현재 작업과 별개라 보류됨):
  1. [피드백] — [이유]

→ 컨벤션 후보는 지금 /review의 "컨벤션/스킬 개선 제안"으로 반영할까요?
→ 별도 plan 후보는 지금 각각 별도 plan(+짝 backlog)으로 분리할까요? (전체 / 일부 / 보류)
```

**판단 기준**:
- 1회성 피드백(사용자 선호 1건) → backlog에 남김
- **3회 이상 반복 패턴** 또는 **구조적 안티패턴** → `.claude/rules/*.md`(anti-patterns/react/conventions 등) 또는 CLAUDE.md 업데이트 제안
- **분리 선택 시**: 후보별 `{새작업명}.md` + `{새작업명}.backlog.md` 신설 → 원본 backlog 후보 행 상태를 🔀 + `→ {새파일}`로 갱신
- **보류 시**: ⏳ 상태 유지 — 다음 ship 사이클에서 재제시

본 단계는 **`/ship`의 핵심 가치 중 하나** — 단순 커밋이 아니라 "한 cycle의 학습을 시스템에 박는다"는 의미.

### 9. 세션 리포트 생성

커밋 완료 후 세션 JSONL을 파싱하여 스킬/토큰/중복/미사용을 보고:

```bash
bash .claude/skills/ship/scripts/session-report.sh
```

**출력 포함 항목:**

- 사용 스킬/커맨드 (슬래시 + Skill tool)
- 사용 에이전트 (subagent_type별 호출 횟수)
- 주요 도구 사용 (상위 10)
- 토큰 소비 (Fresh Input / Cache Read+hit-rate / Cache Create / Output)
- 예상 비용 (모델별)
- 중복 호출 (2회 이상)
- 미사용 스킬 (이번 세션)

**실패 허용성**: JSONL 포맷 변경 등으로 파싱 실패 시 **경고만 출력하고 ship은 계속 진행**.

**저장 위치**:

- 기본: stdout에 마크다운 출력 → 사용자가 복사/저장 가능
- 진행 중인 plan 문서가 있다면 "세션 리포트" 섹션에 append 권장 (수동)
- 민감 정보 유출 방지를 위해 git 커밋 대상 아님

## 주의사항

- 각 단계에서 설명이나 질문 없이 바로 실행
- 에러 발생 시 수정 → 재검증 루프 (최대 3회)
- 3회 실패 시 사용자에게 보고
- 세션 리포트는 정보 제공 목적 — 커밋 실패로 이어지지 않음
- `/review-ui` 이미 실행한 세션이면 Step 5 브라우저 검증 생략
