# book-search-app backlog

> plan(`book-search-app.md`)의 피드백 원장(ledger). 모든 피드백을 여기 먼저 기록 후 라우팅. plan과 짝으로 ship까지 누적 — 길 잃지 않기 위한 SOT.

## 상태 범례

- ✅ 반영 완료 (현재 plan에 박힘)
- 🔀 분리됨 (→ 별도 plan, 사용자 명시 시 즉시)
- ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)
- 💡 harness-up 후보 (룰/스킬 승격)
- 📤 승격됨 (SOT 위치 기록)

## 피드백 원장

| # | 받은 피드백 | 주제 | 라우팅 | 상태 |
|---|---|---|---|---|
| F-0 | plan 수립 전 확정 결정 4건: 아코디언 단일 열림 / 본문 10px 시안 준수 / 완전 반응형 / 서버 프리페치+메타데이터 (2026-07-07) | on | plan "결정 사항"에 기록 | ✅ |
| F-1 | 제출용 레포임을 유념 — 면접관이 스캐폴딩 방식·Claude 스킬/하네스 사용을 이해 못 하면 역효과. README+readme.html에서 이런 부분을 적절한 수위로 정리해 설명할 것 (2026-07-08) | on | Step 5.4 작업 확장: "AI 협업 방식" 섹션(하네스=품질 통제 장치, 리뷰 게이트로 코드 이해 보장, 전문용어 최소화) | ✅ |
| F-2 | **중대 전환**: 과제 필수 스택이 "React.js"임을 재확인 — Next.js → **Vite + React CSR** 전환 결정. react-router v7, git 히스토리 리셋 후 클린 시작, .docs/기본 셋팅은 유지하되 Next 흔적 제거 (2026-07-08) | on | plan 전면 개정(프록시 폐기→카카오 직접 호출, SSR 프리페치→성능 어필 축 전환), 하네스 Next→Vite 수정, 히스토리 재작성 | ✅(plan.md 2026-07-08 전면 개정으로 완료, .claude 하네스 잔재는 task #5 진행 중) |
| F-3 | 라이브러리/구현 방식 결정은 결론 표로 일괄 제시하지 말고 PAAR(Problem-Alternatives-Analysis-Result)로 한 항목씩 논의할 것. "스펙은 정의일 뿐, 구현은 PAAR를 거쳐 planning으로 고민해야" (2026-07-08) | on | 이후 모든 기술 결정에 PAAR 적용 — [[feedback-paar-decision-framework]] 메모리 저장 | ✅ |
| F-4 | `add-dir`로 연결한 레퍼런스 프로젝트(사용자가 최근에 깔끔하게 구성했다고 밝힌 Next.js 어드민 프로젝트)를 툴링(husky/eslint 등) 참고 기준으로 활용할 것. "나중엔 add-dir 내용은 다 뺄 것" (2026-07-08) | on | ESLint/Prettier/Husky 구성 조사 후 PAAR 근거에 반영 완료. add-dir 참조는 세션 한정(레퍼런스일 뿐 코드 복사 아님) | ✅ |
| F-5 | Step 2.1 에러 정규화 논의 중: code값 세분화 대신 status만으로 critical(401/403/404/503/5xx→에러 페이지)/recoverable(400·네트워크→토스트) 2분류. 문서 표(`{code,msg}`) 대신 라이브 curl로 실응답(`{errorType,message}`) 직접 확인할 것 지시 (2026-07-08) | on | plan Step 2.1/3.2/4.1/"결정 사항"에 반영 완료 | ✅ |
| F-6 | `src/lib/api/client/` 네이밍이 Next.js 흔적 아니냐는 지적 → Vite/react-router 레퍼런스(실제 Vite CSR) + Next.js 어드민 레퍼런스(add-dir 재연결) 구조 비교 조사 지시. 최종 절충안: `client/` 제거(axios는 `index.ts`) + 도메인별 `api.interface.ts` 분리 채택 + `api.exception.ts`는 필요시에만 추가 (2026-07-08) | on | `CLAUDE.md`/`conventions.md`/`page.md`/plan "결정 사항" 전부 반영 완료 | ✅ |
| F-7 | Step 2.1의 `http`→`api` 개명 지시 후, `ApiError`/`classifyApiError`/`CRITICAL_MESSAGE`/`RECOVERABLE_MESSAGE`를 "AI가 짠 티 난다"며 전부 폐기 지시 — `validateStatus`로만 체크. 이후 Vite/react-router 레퍼런스 재분석 요청으로 `FailResponse`(shared/response.ts) + `isError` 절충안 논의 → 최종적으로 DEV 콘솔 로그 인터셉터까지 제거하고 `isError` 헬퍼도 인라인으로 걷어냄. critical/recoverable UX 분류는 Step 4.1(소비 시점)로 완전히 이연 (2026-07-08) | on | `src/lib/api/index.ts` 최종본 = axios.create + validateStatus 한 줄. `CLAUDE.md`/`conventions.md`/`page.md`/plan Step 2.1 반영 완료 | ✅ |
| F-8 | Step 2.2: `useInfiniteQuery` 반환 `pages[]`를 select로 평탄화하는 추천 방향에 동의. size는 요구사항대로 10 고정 재확인. "가능하면 TanStack Virtual 스크롤도 같이 연동" 요청 — 이 Step엔 렌더링할 리스트 UI가 없어 실제 연동은 Step 3.2/4.2로 이연, 잊지 않도록 plan에 후보 기록 (2026-07-08) | on | api.queries.ts에 select 반영 완료, plan Step 2.2에 TanStack Virtual 후보 기록 완료 | ✅ |
| F-9 | 3건 동시 지적(2026-07-08): (1) `.env.example`에 실키가 워킹트리에 들어가 있던 걸 발견 후 `.env`(gitignore 대상)로 옮기라 지시 — 커밋 전이라 이력 유출은 없었음. (2) `__tests__/`가 repo 루트에 있는데 Vite/react-router 레퍼런스는 `src/` 하위에 colocate하므로 그 기준으로 옮기라 지시. (3) Vite/react-router 레퍼런스 실제 코드(`getDashBoardList` 등) 발췌 제시하며 네이밍 전체를 그 컨벤션으로 맞추라 지시 — `get{Domain}List` 패턴, 페이지네이션 메타는 `shared/response.ts`로 | on | `.env` 생성+`.env.example` 원복, `__tests__`→`src/__tests__` 이동(vitest configs·tsconfig 갱신), `getBookList`/`BookListParams`/`bookKeys.list`/`EMPTY_BOOK_LIST`/`KakaoSearchResponse<T>` 전체 리네이밍 완료(소스+테스트+.claude 규칙 문서 전부 sweep) | ✅ |
| F-10 | Step 2.3 논의 중 방향 전환: (1) 찜에 React Query 쓰는 이유 반문 → react-router가 라우트 전환 시 언마운트하니 동시 동기화 니즈 없음, `useState` 기반으로 단순화 동의. (2) 검색기록 중복 처리는 "기존 지우고 맨 앞 재추가"로 확정, 기록 시점은 명시적 검색 실행만(debounce와 무관). (3) 최종적으로 "Phase 2는 서버 설계 단계, storage 같은 실제 UI 소비 로직은 지금 안 만들고 Step 4.2/4.3(실제 하트/검색창 UI 만들 때)로 이연" 결정 — 저장 레이어는 `lib/utils/localStorage.ts`(범용 getItem/setItem) 선호 스타일 공유 (2026-07-08) | on | Step 2.3 미구현 상태로 plan에서 Phase 4로 이연 표기, 합의 사항은 Step 4.2/4.3에 기록 완료 | ✅ |
| F-11 | 개발 중이라 지금은 상관없지만 add-dir로 참고한 레퍼런스 프로젝트 실명이 제출용 레포에 남는 걸 숨기고 싶다는 지시 — 단 `.claude/`(스킬·규칙)는 이번엔 손대지 말고, `.docs/`(plan+backlog)와 `src/`+설정 파일(주석) 기준으로 전수조사할 것 (2026-07-08) | on | `.docs/plans/book-search-app.{md,backlog.md}`에서 web-andrsen/vxt-fashion-admin/web-vxt 실명 15곳 익명화("Vite/react-router 레퍼런스"/"Next.js 어드민 레퍼런스"), `tsconfig.{app,node}.json`의 스캐폴딩 주석 2건 제거, `src/`·`CLAUDE.md`는 이미 클린 확인. `.claude/`는 지시대로 미변경(여전히 실명 다수 잔존) | ✅ |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없음) | | | |

## 💡 harness-up 후보

| # | 내용 | 승격 위치 | 상태 |
|---|---|---|---|
| H-1 | 데이터 계층에서 소비 UI 없이 에러 severity/메시지 분류부터 설계(F-7) → 이후 storage도 동일 패턴 재발 조짐(F-10에서 사용자가 직접 일반화) — 원칙화 | `karpathy-principles.md` "도서 검색 과제 적용 예시 4" 신규 행 | 📤 승격됨 |
| H-2 | 레퍼런스 프로젝트 구조를 그 존재 이유 확인 없이 그대로 복사(F-6, `client/` 폴더 vestige) | `ai-defense.md` "레퍼런스 프로젝트 구조 맹목적 복사 금지" 신규 절 | 📤 승격됨 |

## ⏳ 미결 (별도 plan/시점)

- 카카오 REST 키 발급 (사용자 액션 — Phase 2 실 스모크 전까지)
- Vercel 계정 연결 (사용자 액션 — Phase 5.3 전까지)
- Figma PAT 7일 유효 (2026-07-14경 만료) — 만료 전 디자인 재실측 필요분 완료할 것

## 참고 문서 영향 (.docs/design·spec 갱신 후보)

> masterPlan 미운영 프로젝트 — 대신 참고 문서(tokens/components/requirements)와 구현이 어긋나면 여기 기록 후 갱신.

| # | 변경 | 대상 문서 | 처리 시점 | 상태 |
|---|---|---|---|---|
| D-1 | #1 "카카오 호출은 Next.js Route Handler 프록시 경유" → 클라이언트 직접 호출로 정정 | `.docs/spec/requirements.md` | task #4 | ✅ |
| D-2 | #11 "SEO: 메타데이터·OG, 서버 프리페치(Hydration)" → CSR 전환으로 서버 프리페치 불가, 대체안 보류 표기 | `.docs/spec/requirements.md` | task #4 | ✅ |
