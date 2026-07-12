# final-review-cleanup

> 상태: 🔵 진행 중

## 목표

제출(면접관 열람) 전 최종 검수 — ① 타레포명/민감정보 익명화 ② 소스 무주석화 ③ 룰 정합·미사용 코드 제거를 반영하고, lint/types/unit/integration/e2e 전 검증을 통과시킨다.

## 요구사항

- WHEN public 레포를 면접관이 열람 THEN 타 개인/회사 레포명(web-andrsen·vxt-fashion-admin·web-vxt·VXT)·개인 홈경로·Figma 파일키/PAT가 어디에도 남지 않는다
- WHEN src/e2e/루트설정 소스를 읽음 THEN WHY 주석(라이브러리·브라우저 특이동작 우회)과 기능성 지시자(eslint-disable, pragma)만 남고 도메인 설명 주석은 전부 제거된다
- WHEN 코드베이스를 룰 기준으로 검수 THEN `component/`→`components/`, 미사용 export/deps 제거, react.md 참조안정성/deps 위반이 해소된다
- WHEN 최종 검증 THEN lint(0 error) · check-types · test:unit · test:integration · e2e가 통과한다

## 현재 상태 (검수 결과 요약 — 3에이전트 + lint/types/test baseline)

- **layouts `.style.ts` 부재는 위반 아님**: page.md 스타일 규약은 `src/pages/**`만 스코프, `.style.ts` 분리는 강제 아님. → 진짜 위반은 폴더명 `component/`(단수).
- **타레포명 14건**: 전부 `.docs/`(8)·`.claude/`(6). src·루트설정·CLAUDE.md·README·PROCESS.md는 0건.
- **민감정보**: 하드코딩 키/이메일/PAT 실토큰 0, `.env` 미커밋. Low = `harness-up/SKILL.md` 홈경로 노출, Figma 파일키 노출(`tokens.md`·`screens.md`).
- **주석**: src 소스에 금지 마커(날짜/노드ID/타레포명) 거의 없음. 하네스 흔적 2곳 + Figma 실측 5곳 + 도메인 설명 다수.
- **Dead/과설계**: `App.css` 미사용 · 미사용 애니 프리셋(fadeDown/pop/slideDown 계열)+`compose` export · 미사용 deps(tailwind-merge·@tanstack/react-query-devtools) · Toast 6파일→1소비처(유지 결정).
- **품질**: `useVirtualScroll` effect deps 3개 · `useFavoritesPage.books` useMemo 미적용 · `localStorage.ts` JSON.parse 가드 없음 · `DetailSearchPopover` role="dialog" a11y 계약 미비(Low).
- **검증 baseline**: check-types ✅ / lint 0err 1warn(useVirtualScroll 라이브러리 호환, 불가피) / unit 26 ✅.

## 결정 사항 (Phase 0 — 사용자 4문항 답변)

- `.claude/`: **유지 + 익명화** (타레포명·홈경로만 제거, 룰/스킬 구조 보존)
- `.docs/`: **최소 익명화** (타레포명·Figma파일키·PAT만 제거, 날짜·세션서사·plan 원문은 통제증거로 유지)
- 소스 주석: **엄격 무주석화** (WHY 주석·기능성 지시자만 유지, 도메인 설명·JSDoc 프롭독 제거)
- 과설계: **미사용만 제거** (Toast·classifyQueryError·useOutsideClick 등 정당 추상화 유지)
- CLAUDE.md 루트: 타레포명/민감정보 0 + 날짜·서사는 `.docs` 최소익명화 방침과 일관되게 **유지** (이번 청소 대상 아님)
- `localStorage.ts` 환경가드: CSR 단독앱이라 `typeof window` 가드는 과방어로 판단 → **JSON.parse try/catch만** 추가(손상 데이터 마운트 크래시 방지=정확성)
- 1 warning(useVirtualScroll): TanStack Virtual 라이브러리 구조상 불가피 → 억제하지 않고 그대로 둠(억제 지시어가 오히려 노이즈)

---

## 체크리스트

### Phase 1: 타레포명·민감정보 익명화

- [x] Step 1.1: `.claude/` 타레포명 익명화 (유지+익명화)
  - 작업: `rules/ai-defense.md:84`("web-andrsen, vxt-fashion-admin 등"), `skills/harness-up/SKILL.md:9,95`("VXT류"/"VXT의 MCP…"), `skills/review/references/checklists/page-data.md:38`("web-andrsen 컨벤션") → "외부 참고 레포"류로 일반화
  - 검증: `grep -riE 'web-andrsen|vxt-fashion|web-vxt|VXT|andrsen' .claude` → 가드 패턴 제외 0건
- [x] Step 1.2: `.claude/` 가드 패턴 문자열 처리
  - 작업: `hooks/guard-source-hygiene.sh:30`·`skills/security/SKILL.md:125`의 타레포명 grep 패턴 → 일반화하거나 해당 체크 제거(청소 후 유입 위험 낮음). 기능 유지 여부는 실행 시 확정
  - 검증: 훅 문법 유효(`bash -n`) + 남은 실명 0
- [x] Step 1.3: `.claude/` 홈경로 일반화
  - 작업: `skills/harness-up/SKILL.md:33,100,101`의 `/Users/apple/.claude/projects/…` → `~/.claude/projects/<project>/memory/…`
  - 검증: `grep -rn '/Users/apple' .claude` → 0건
- [x] Step 1.4: `.docs/` 타레포명 익명화 (최소)
  - 작업: `plans/book-search-app.md:125`·`book-search-app.backlog.md:28,29,31`·`completed/harness-session-codify.md:3`·`completed/animation-presets.{md:24,115,backlog.md:18}` → 일반화 ("Vite/react-router 레퍼런스"/"Next.js 어드민 레퍼런스"/"외부 애니메이션 레퍼런스")
  - 검증: `grep -riE 'web-andrsen|vxt-fashion|web-vxt|VXT' .docs` → 0건
- [x] Step 1.5: `.docs/` Figma 파일키·PAT 제거
  - 작업: `design/tokens.md:3`·`design/screens.md:3` 파일키 `VHM0w7IBWLaaCJp0l9Mkff` 제거/마스킹. `completed/figma-visual-parity.md`(PAT 만료 서술)·`book-search-app.backlog.md:63` PAT 언급 제거. 노드ID는 최소익명화 방침상 유지
  - 검증: `grep -rn 'VHM0w7IBWLaaCJp0l9Mkff\|figd_\|PAT' .docs` → 0건

### Phase 2: 소스 무주석화 (엄격 — WHY·지시자만 유지)

- [x] Step 2.1: src 하네스/Figma 흔적 주석 제거
  - 작업: `useFavoritesPage.ts:30`(react.md 참조), `layouts/component/Header.tsx:5`·`pages/home/styles/DetailSearchPopover.style.ts:7,12`·`SearchField.style.ts:6`·`pages/home/components/BookListItem.tsx:39`·`pages/favorites/components/FavoriteBookItem.tsx:39`(Figma 실측 언급) 제거
  - 검증: `grep -rniE 'Figma|react\.md|node [0-9]+:' src` → 0건
- [x] Step 2.2: src 도메인 설명 주석 제거 (WHY 유지)
  - 작업: constants·utils·lib·routing·store·hooks·components·JSDoc 프롭독의 설명 주석 제거. **유지**: IME/focus/native-Esc/애니 열림닫힘/URL동기화 React패턴/재시도 사유/virtualizer key 재마운트 등 WHY 주석, `Item.tsx:20` eslint-disable, `*.integration.test.tsx:1` @vitest-environment pragma
  - 검증: 각 파일 육안 + `pnpm check-types` 통과
- [x] Step 2.3: 루트 설정 + e2e 주석 정리
  - 작업: `eslint.config.js:14,30`(하네스 언급)·`playwright.config.ts:3,14`(Figma)·`vitest.{unit,integration}.config.ts:13` 프로세스 주석 제거. `e2e/search-ux.spec.ts:4` 등 티켓ID(F-11~14)·프로세스 흔적 제거
  - 검증: `grep -rniE 'F-1[0-9]|재검증|발견|하네스|Figma' eslint.config.js playwright.config.ts vitest.*.config.ts e2e` → 0건

### Phase 3: 룰 정합·미사용 코드 제거

- [x] Step 3.1: `layouts/component/` → `layouts/components/`
  - 작업: `git mv src/layouts/component src/layouts/components` + `DefaultLayout.tsx`의 Header import 경로 수정
  - 검증: `pnpm check-types` 통과 + `grep -rn 'layouts/component/' src` → 0건
- [x] Step 3.2: 미사용 deps 제거
  - 작업: `package.json`에서 `tailwind-merge`·`@tanstack/react-query-devtools` 제거 → `pnpm install`
  - 검증: `pnpm check-types` + lint 통과, lockfile 갱신
- [x] Step 3.3: `src/App.css` 삭제
  - 작업: import처 재확인 후 파일 삭제 (main.tsx는 index.css만 로드)
  - 검증: `grep -rn 'App.css' src` → 0건 + 앱 정상 렌더
- [x] Step 3.4: `transition.ts` 미사용 프리셋 제거
  - 작업: 앱 미사용 프리셋(`fadeDown`·`pop`·연쇄 미사용 `slideDown`)과 외부 미사용 `compose` export 제거. 실사용(fade·dropdown·scaleUp·fadeUp)과 그 조립에 필요한 것만 유지. 파일 열어 의존 그래프 확정
  - 검증: `grep -rn 'animation\.\(fadeDown\|pop\|slideDown\)\|compose' src` → 소비처 0 확인 후 제거, check-types 통과
- [x] Step 3.5: react.md 품질 위반 3건
  - 작업: (a) `useVirtualScroll.ts:34` effect deps 3→2(파생 boolean으로 축소) (b) `useFavoritesPage.ts:26` `books` useMemo 래핑 (c) `utils/localStorage.ts` getter에 JSON.parse try/catch fallback
  - 검증: check-types + unit 통과, 참조안정성 grep
- [x] ~~Step 3.6 (Low, 선택): `DetailSearchPopover` role="dialog" 정합~~ **되돌림**
  - 판정: 제거 시도했으나 e2e(`journey.spec.ts:45,61,67`·`home.spec.ts:70`)가 `role="dialog"`를 셀렉터·접근성 계약으로 **명시 검증**. 이 팝오버는 의도된 **비모달 dialog**(dismissible=닫기버튼+outside click+Esc). 제거는 회귀 → role 복원. 미변경 유지

### Phase 4: 최종 검증

- [x] pnpm lint (0 error, 1 warning=TanStack 라이브러리 호환 불가피)
- [x] pnpm check-types
- [x] pnpm test:unit (26 통과)
- [x] pnpm test:integration (9 통과)
- [x] e2e (playwright) — 15 통과
- [x] 전 grep 게이트 재확인 (타레포명·홈경로·파일키·Figma·하네스 흔적 0)

---

## 수정 파일 목록

| 파일 | 작업 |
| --- | --- |
| .claude/rules/ai-defense.md, skills/harness-up/SKILL.md, skills/review/references/checklists/page-data.md | 익명화 |
| .claude/hooks/guard-source-hygiene.sh, skills/security/SKILL.md | 가드 패턴 처리 |
| .docs/plans/book-search-app.{md,backlog.md}, completed/{harness-session-codify.md, animation-presets.md, animation-presets.backlog.md, figma-visual-parity.md} | 익명화 |
| .docs/design/tokens.md, screens.md | 파일키 제거 |
| src/** (다수) | 무주석화 |
| eslint.config.js, playwright.config.ts, vitest.{unit,integration}.config.ts, e2e/*.spec.ts | 주석/티켓ID 정리 |
| src/layouts/component/ → components/ | 폴더 rename |
| package.json, pnpm-lock.yaml | deps 제거 |
| src/App.css | 삭제 |
| src/lib/animation/transition.ts | 미사용 프리셋 제거 |
| src/hooks/useVirtualScroll.ts, src/pages/favorites/hooks/useFavoritesPage.ts, src/utils/localStorage.ts | 품질 수정 |
| src/pages/home/components/DetailSearchPopover.tsx | role 정합(Low) |

## 실패 위험 (Pre-mortem)

- [ ] 폴더 rename 시 import 경로 누락 → check-types로 즉시 검출
- [ ] 무주석화로 WHY 주석까지 실수로 제거 → C카테고리(IME/focus/anim/React패턴) 화이트리스트 사수
- [ ] transition.ts 프리셋 제거 시 조립 의존(fadeUp이 slide+fade 합성) 끊김 → 소비 그래프 확인 후 제거
- [ ] deps 제거 후 tailwind-variants 내부 tailwind-merge 의존 문제 → tv()는 자체 번들, 직접 의존만 제거라 무영향(검증으로 확인)
- [ ] 가드 훅 패턴 제거가 훅 문법 깨뜨림 → `bash -n`

## 발견 사항 / backlog

→ `.docs/plans/final-review-cleanup.backlog.md`

## 컨벤션 변경 필요

- (실행 중 발견 시 기록)
