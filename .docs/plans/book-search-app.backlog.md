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
| F-11 | 개발 중이라 지금은 상관없지만 add-dir로 참고한 레퍼런스 프로젝트 실명이 제출용 레포에 남는 걸 숨기고 싶다는 지시 — 단 `.claude/`(스킬·규칙)는 이번엔 손대지 말고, `.docs/`(plan+backlog)와 `src/`+설정 파일(주석) 기준으로 전수조사할 것 (2026-07-08) | on | `.docs/plans/book-search-app.{md,backlog.md}`에서 레퍼런스 프로젝트 실명 15곳 익명화("Vite/react-router 레퍼런스"/"Next.js 어드민 레퍼런스"), `tsconfig.{app,node}.json`의 스캐폴딩 주석 2건 제거, `src/`·`CLAUDE.md`는 이미 클린 확인. `.claude/`는 지시대로 미변경(여전히 실명 다수 잔존) | ✅ |
| F-12 | Phase 4 리뷰 후속 — HomePage 슬라이스 재구성 8건(2026-07-08): (A) tv 레이아웃 `styles/page.style.ts`(container/wrapper, 외부 레퍼런스 참고) (B) `HomePageContent`+`Context.Provider` 분리·SearchSection/ResultSection 조립(Vite/react-router 레퍼런스) (C) searchHandler+historyHandler→`homeHandler` 통합 (D) 파생상태 `hasBooks`(원안 useMemo) (E) storage 폴더 폐기→`src/utils/localStorage.ts` 순수함수(getLocalStorage/setLocalStorage)+`constants/localStorageKey.ts` (F) `useSearchHistory`를 `src/hooks/` 공통 훅으로 승격(재사용 대비 레이어 분리, 과설계 가능성 인지) (G) `api.queries.ts` options 오버라이드(`Omit<...,"queryKey"|"queryFn">`, Next.js 어드민 레퍼런스) (H) useHome에 카카오 검색 params state(size:10 default) | on | PAAR 개별 논의 — A/B/C/E/G 수용 방향. **충돌 3건**: D(useMemo는 react.md "primitive useMemo 금지"+RX-12 위반→select/인라인), H(YAGNI+nuqs와 상태 SOT 이원화), F(과설계 인정한 결정—수용하되 useEffect deps 패턴 교정) | 🔵 논의 중 → 구현 완료(④는 placeholderData 함수형 대신 keepPreviousData 채택, 문서동기화 ship 대기) |
| F-13 | Phase 4 리뷰 후속 2차(2026-07-08) 9건: (1) SearchBar Esc로 히스토리 팝업 닫기 (2) 히스토리 방향키 네비+호버/포커스 하이라이트(Figma 3000-647) (3) DetailSearchPopover의 useState/useEffect/ref/submit 전부 useHome 이관—컴포넌트는 Context 소비만 (4) ResultSection `isSearching`도 useHome 파생으로 (5) home/components 전반 비즈니스 로직 useHome 집중 (6) `styles/{Component}.style.ts` 1:1 매핑 (7) @tanstack/react-virtual 가상 스크롤 도입(DOM 누적 최적화) (8) localStorage 등 과한 방어로직 제거(가독성) (9) 헤더-본문 정렬 Figma 18-969/18-805 준수·중앙정렬 제거. +Dropdown onChange 타입(`Dispatch<SetStateAction<SearchTarget>>` vs `(string)=>void`) | on | 순서 제안: (8)방어제거→(3·4·5)아키텍처+Dropdown타입→(6)styles→(7)가상스크롤→(1·2)히스토리 UX[Figma]→(9)헤더[Figma]. Figma PAT 필요(2·9) | ①②③ 완료(8 방어제거 / 3·4·5 아키텍처=4슬롯·useSearchInput·useOutsideClick·Dropdown타입 / 6 styles 1:1). 부수결정: ④는 keepPreviousData, classnames-order eslint off(prettier SOT). **잔여: ④ 가상스크롤[설계논의]·⑤⑥[Figma review-ui 풀검수→구현, 상세검색 라인정렬 어긋남 지적]** | 🔵 진행 중 |
| F-14 | 외부 레퍼런스 `packages/animation` 기준 transition 애니메이션 프리셋 도입(framer-motion). 병렬 세션(Figma검증·찜목록)과 충돌 회피 위해 별도 plan으로 (2026-07-08) | off | 사용자 "새로운 플래닝" 명시 → 즉시 분리: **`.docs/plans/animation-presets.md`**(+backlog A-1~4). 인프라만(충돌 0)·소유 파일 무수정 | 🔀 분리됨 |
| F-15 | "내가 찜한 책 화면 만들자 — home 슬라이스 참고, 구현계획 체크 후 구현". Phase0 결정: 찜 페이지네이션 = **자동 무한 스크롤**(10개씩 append, IntersectionObserver, 가상화 없음 — 소량 로컬) (2026-07-08) | on | 현재 plan Step 4.3 구체화(4.3a~d) | ✅ |
| F-16 | **BookListItem/EmptyState 공유 승격 반대** — "승격 안 함. 별도로 만들어 진행. 3곳 이상 안 겹치니 재사용 안 한다고 (README에) 밝힐 것. 찜은 도메인/데이터가 다르니(찜 목록 API·인터페이스) 재사용 컴포넌트가 맞지 않다." (2026-07-08) | on | Step 4.3 승격안(구 4.3a/b) 폐기 → 홈 무수정, 찜 지역 `FavoriteBookItem`+자체 빈상태(자기 Context 소비). 근거=3곳 룰(2<3)+CP-1+도메인 분리. 핸드오프 메모리 "승격" 지침 override. 파생 질문: 찜 타입 (a)BookData 재사용 vs (b)FavoriteBook 신설 | ✅ 타입=(b) `FavoriteBook` 신설 확정(스냅샷 DTO, useFavorites co-locate, `toFavoriteBook` 매핑) |
| F-17 | 구현 중 2건 정정 지시: ① "로컬스토리지로 하는거 맞아?"(저장 방식 재확인) ② "왜 인피니트 스크롤? 버추얼 스크롤 써야하는거 아냐? home 체크한거 맞아?" — 찜도 홈처럼 가상화하라는 지적 (2026-07-08) | on | ① **A(localStorage 스냅샷) 확정** — 카카오 찜/상세조회 API 없음 문서검증(`/v3/search/book` 단일, 배치·단건조회 불가, isbn 10+13 공백결합), 백엔드 없는 CSR + [F]스펙. ② **F-15 '가상화 없음' 정정** — 무한스크롤(로드방식)과 비가상화(렌더방식) 혼동이었음 → 홈 `useBookListVirtualizer` 재사용으로 전환, `useInfiniteScroll` 폐기. react.md '찜 가상화 금지' 룰도 정정(📤 적용됨) | ✅ |
| F-18 | `src/hooks` 재편 피드백: `useBookListVirtualizer`→범용 네이밍, `useSearchInput` 위치·형태 정리, `useFavorites`/`useSearchHistory` 배치 근거 확인 (2026-07-09) | on(별개 리팩토링) | 사용자 "새로운 플래닝" 명시 → 즉시 분리: **`.docs/plans/hooks-restructure.md`**(+backlog F-1~6). 훅 레이어 정리(리네임+이동+원칙 명문화) | 🔀 분리됨 |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없음) | | | |

## 💡 harness-up 후보

| # | 내용 | 승격 위치 | 상태 |
|---|---|---|---|
| H-1 | 데이터 계층에서 소비 UI 없이 에러 severity/메시지 분류부터 설계(F-7) → 이후 storage도 동일 패턴 재발 조짐(F-10에서 사용자가 직접 일반화) — 원칙화 | `karpathy-principles.md` "도서 검색 과제 적용 예시 4" 신규 행 | 📤 승격됨 |
| H-2 | 레퍼런스 프로젝트 구조를 그 존재 이유 확인 없이 그대로 복사(F-6, `client/` 폴더 vestige) | `ai-defense.md` "레퍼런스 프로젝트 구조 맹목적 복사 금지" 신규 절 | 📤 승격됨 |
| H-3 | 입력 버퍼(draft)는 페이지 Context에 올리지 말고 컴포넌트 지역 훅(`useSearchInput`)으로 격리(F-13 ②) | `react.md` "컴포넌트 무상태 원칙"(입력버퍼 격리) | 📤 승격됨 (2026-07-08) |
| H-4 | ref를 Context value에 담지 말 것 — `react-hooks/refs`(React19) render 중 플래그. dedicated 훅이 소유·반환(F-13 ③) | `react.md` "ref는 dedicated 훅이 소유" + `anti-patterns.md` RX-15 | 📤 승격됨 |
| H-5 | Tailwind 클래스 정렬 `prettier-plugin-tailwindcss` 단독 SOT, eslint `classnames-order` off(F-13 ⑥) | `conventions.md` "Tailwind 클래스 정렬 — Prettier 단독 SOT" | 📤 승격됨 |
| H-6 | `useInfiniteQuery.data`=`TData\|undefined` → `keepPreviousData + ?? EMPTY`가 `??` 최소(F-13 ④) | `anti-patterns.md` RX-12 보강 | 📤 승격됨 |
| H-7 | 페이지 Context 슬롯 네이밍 = 컴포넌트 UI 1:1(searchBar/history/result)(F-13 ②) | `react.md` "컴포넌트 무상태 원칙"(Context 슬롯 1:1) | 📤 승격됨 |
| H-8 | 컴포넌트 분할 4신호(재사용/자체상태·계약/독립분기/부모가독성붕괴) + 공유=props·페이지지역=context 조회 (세션) | `page.md` "컴포넌트 분할·배치 기준" | 📤 승격됨 |
| H-9 | React Query v5 per-query onError 없음 → QueryCache onError + `meta.errorMessage` 엔드포인트 귀속 (세션) | `react.md` "에러 처리 — v5는 per-query onError 없음" | 📤 승격됨 |
| H-10 | 가상화(`useBookListVirtualizer`)+내부스크롤 앱셸(`h-dvh`→`flex-1 min-h-0 overflow-y-auto`) (세션) | `react.md` "가상 스크롤·앱셸" | 📤 승격됨 |
| H-11 | 페이지 스타일 파일 `{Name}.style.ts`+`{name}Variants`(pageVariants 통일 폐기) (세션) | `page.md`·`conventions.md` 네이밍 | 📤 승격됨 |
| H-12 | RX-13 완화 — empty를 BookList `empty` prop 대신 페이지 단일-return 분기로(conventions 단일 return과 정합). **미승격**(RX-13과 정면 충돌 조정 필요, 다음 harness-up) | `anti-patterns.md` RX-13 조정 | 후보 |

## ⏳ 미결 (별도 plan/시점)

- 카카오 REST 키 발급 (사용자 액션 — Phase 2 실 스모크 전까지)
- Figma 접근 토큰 유효기간 내 디자인 재실측 필요분 완료할 것

> Vercel 배포 미채택(2026-07-09) — 클라이언트 키 실노출/쿼터 남용 리스크 + 과제 필수 아님. 로컬 실행법·Lighthouse 지표를 README에 기록하는 것으로 대체.

## 참고 문서 영향 (.docs/design·spec 갱신 후보)

> masterPlan 미운영 프로젝트 — 대신 참고 문서(tokens/components/requirements)와 구현이 어긋나면 여기 기록 후 갱신.

| # | 변경 | 대상 문서 | 처리 시점 | 상태 |
|---|---|---|---|---|
| D-1 | #1 "카카오 호출은 Next.js Route Handler 프록시 경유" → 클라이언트 직접 호출로 정정 | `.docs/spec/requirements.md` | task #4 | ✅ |
| D-2 | #11 "SEO: 메타데이터·OG, 서버 프리페치(Hydration)" → CSR 전환으로 서버 프리페치 불가, 대체안 보류 표기 | `.docs/spec/requirements.md` | task #4 | ✅ |
| D-3 | F-13 구조 변경 — `src/lib/utils`→`src/utils`, `src/lib/storage` 폐기(→`src/hooks` 상태 훅 + `src/utils/localStorage` 순수 래퍼), `src/hooks` 신설(useSearchHistory/useFavorites/useSearchInput/useOutsideClick), localStorage 방어로직 제거 | `conventions.md`/`page.md`/`CLAUDE.md`의 lib/utils·lib/storage 표기 sweep | 다음 세션 harness-up | ⏳ |
