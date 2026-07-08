# hooks-restructure backlog

> plan(`hooks-restructure.md`)의 피드백 원장(ledger). 모든 피드백을 여기 먼저 기록 후 라우팅. plan과 짝으로 ship까지 누적 — 길 잃지 않기 위한 SOT.

## 상태 범례

- ✅ 반영 완료 (현재 plan에 박힘)
- 🔀 분리됨 (→ 별도 plan, 사용자 명시 시 즉시)
- ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)
- 💡 컨벤션 개선 후보 (규칙 승격 — /review에서 반영 판단)

## 피드백 원장

| # | 받은 피드백 | 주제 | 라우팅 | 상태 |
|---|---|---|---|---|
| F-1 | `useOutsideClick`은 공통 이해됨 — 유지 | on | 유지(변경 없음) | ✅ |
| F-2 | `useBookListVirtualizer`는 react-virtual 래퍼일 뿐 → `useVirtualScroll`처럼 어디서든 쓸 범용 네이밍으로 | on | Phase 1 | ✅ |
| F-3 | `useFavorites`가 왜 필요한지 체크 — 책검색/찜이 서로 써서인지 | on | 체크 완료: home write + favorites read/write 공유 SOT → 유지 | ✅ |
| F-4 | `useSearchHistory`는 잘 됨 — 유지 | on | 유지(변경 없음) | ✅ |
| F-5 | `useSearchInput`은 왜 이 모양이냐, 다듬어라 | on | 원인: home 전용 + anemic(로직이 SearchField에 흩어짐) → Phase 2 | ✅ |
| F-6 | useHome 처리 vs home/hooks/ 분리 고민 | on | Phase 0 결정: useHome 흡수는 입력버퍼 Context 격리 위반 → page-local + 로직 흡수 | ✅ |
| F-7 | useSearchHistory도 공통이 맞나 — home에서만 쓸 건데 | on | 재검토: 도메인 훅(검색기록)이고 home 단일 소유 → `src/pages/home/hooks/`로 이동. Phase 5 | ✅ |
| F-8 | useFavorites도 이렇게 가는 게 맞나 + "localStorage 다루면 다 공통이냐? 이상하지 않냐" | on | 원칙 결함 인정 → **2단계 판정 재정립**: ① 제네릭 메커니즘이면 src/hooks / ② 도메인 훅이면 소유자(단일=페이지, 공유=도메인 모듈). localStorage는 구현 디테일이지 공통 근거 아님. useFavorites=진짜 2라우트 공유 도메인 → `src/lib/favorites/`. Phase 4·6 | ✅ |
| F-9 | "훅이면 state/useEffect 써야 하는 거 아니냐" + "찜은 원래 API 있어야 할 local" + 네이밍 변경 + 예시 요청 | on | 순수/훅 분리 확정: `favorites.ts`(순수 도메인 — FavoriteBook·toFavoriteBook·read/write/toggle/isFavorite) + `useFavorites.ts`(얇은 상태 훅). books의 `api.ts`+`api.queries.ts`와 동형. Phase 4 | ✅ |
| F-10 | (구현 중 발견, 사용자 피드백 아님) 병렬 test-strategy 세션이 같은 워킹트리에 co-located 테스트 미커밋 — `src/hooks/useFavorites.test.ts`·`useSearchHistory.test.ts`가 내가 옮긴 훅을 참조(고아) | 발견 | 두 테스트를 subject 옆으로 이동(`lib/favorites/`·`pages/home/hooks/`) — 상대 import 보존, 동작 불변, test:unit 19/19 통과. **ship 시 병렬세션 파일과 분리 커밋 필요** | ⚠️ 조율 |
| F-11 | (동작) 검색어→enter 시 히스토리 popover 닫힘? 현황 유지, UX 고민 | on | **확정: 닫기**. `useSearchInput.onEnter`에서 검색 실행 후 `inputRef.blur()` → onBlur가 popover 정리. Phase 7. (ship 스모크) | ✅ |
| F-12 | (동작·버그) 새 검색 호출 시 스크롤이 top으로 초기화 안 됨 | on | **수정 완료(Playwright 검증)**: `BookResultList`를 검색키로 `key` 재마운트. 명령형 초기화는 react-virtual offset 복원으로 실패 → key로 virtualizer 재생성이 정답. Phase 7 Step 7.1. | ✅ |
| F-13 | (동작) 검색 포커스→Esc 시 clear 안 눌러도 input value까지 삭제 — 의도인지? | on | 원인 = `type="search"` 네이티브 Esc-clear. **확정: popover만 닫고 값 보존** → Esc에서 `preventDefault()`+`setIsFocused(false)`. Phase 7. (ship 스모크) | ✅ |
| F-15 | (디자인) 검색기록 UI가 Figma와 다름 — Figma는 검색창과 연속된 하나의 박스, 현재는 아래 별도 떠있는 드롭다운 | on | **완료(Figma `Frame 77`/3000:647 실측·구현·스크린샷 검증)**: SearchField 연속 박스(pill 하단 각지게+히스토리 하단 r24 박스, seamless), 히스토리 텍스트 #8D94A0·X 24/16 black, Search에 containerClassName 통과. screens.md SOT 정정. e2e #1/#3 회귀 없음 | ✅ |
| F-16 | (디자인) 상세검색 팝업도 Figma와 다름 — 사용자 지적: ①검색어 입력 라인 색 ②취소(X) 위치 | on | **완료(실측·구현·스크린샷 검증)**: ① 입력 언더라인 회색→**primary(#4880EE)**(Figma) ② 닫기 X: self-end(인셋24)→**absolute 코너(인셋8)**, size-5→**size-3(12×12)**, #8D94A0→**#B1B8C0** ③ 팝오버 패딩 pt-2/pb-6→**py-9(36, Figma)**. home.spec 팝오버 테스트 회귀 없음. **미세 잔여: 드롭다운 열림이 3옵션(제목 포함) vs Figma 2옵션(선택 제외) — Dropdown 공용 동작이라 보류** | ✅ |
| F-17 | (디자인, 구현 중 발견) chevron 크기 어긋남 — 상세보기/필터 dropdown | on | **완료**: svg(20×20) 유지, className만 조정 — 필터 size-3→**size-5**(glyph 10×6), 상세보기 size-4→**size-7**(glyph 14×8). Figma 정합. 스크린샷 확인 | ✅ |
| F-17b | (디자인, F-16 후속) 상세검색 입력 언더라인이 포커스 안 해도 파랑 + 제목/입력 라인 안 맞음 | on | **완료**: 언더라인 항상 primary→**기본 회색·포커스 시 primary**(Figma 파랑은 활성 상태였음). 제목(37)/입력(21) 높이 불일치 → 입력 `h-9`(36)로 정렬. 드롭다운 열림 3옵션은 표준 select로 유지(사용자 확정) | ✅ |
| F-18 | (동작) 검색어 입력 후 **로고 클릭 시 입력 안 지워짐** + "key 안 쓰고 안 되냐" | on | **완료(key 없이)**: `SearchField`의 `key={filters.target}` 제거 → `useSearchInput`에서 이전 값 `useState` 비교로 렌더 중 `draft` 동기화(로고·뒤로가기·검색·상세전환 통합). ref는 `react-hooks/refs`에 걸려 `useState`. e2e #5 추가, react.md/anti-patterns 갱신 | ✅ |
| F-19 | (제출 청소) index.html Vite 기본 잔재 + favicon + 미사용 파일 | on | **완료**: index.html `lang=ko`·title·description·`favicon.ico`(vite-tmp 제거) / 미사용 에셋 4개(favicon.svg·icons.svg·react.svg·vite.svg) 삭제 / `.env.example` 삭제 → CLAUDE.md 보안 불변식 갱신 | ✅ |
| F-14 | (디자인) 검색창 X가 파란색 다른 모양 — close.svg여야 | on | 원인 = `type="search"` 네이티브 `::-webkit-search-cancel-button`. **확정: 커스텀**. `Search.style`에 `[&::-webkit-search-cancel-button]:hidden` + SearchField가 값 있을 때 close.svg(#B1B8C0) suffix 버튼(클릭→clear+focus). Phase 7. (ship 스모크) | ✅ |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없음) | | | |

## 💡 컨벤션 개선 후보

- 📤 **훅 배치 2단계 판정 명문화** (F-8/F-9) — **반영 완료**: `react.md`(305~307) + `CLAUDE.md`(49). ① 제네릭 메커니즘 → `src/hooks/` / ② 도메인 훅 → 소유자(단일=페이지 슬라이스, 공유=`src/lib/{domain}/`). localStorage는 공통 근거 아님.
- **찜=서버 없는 로컬 도메인 → books와 동형 분리**: 순수 도메인 파일 + 상태 훅. `src/lib/api/books`(원격) ↔ `src/lib/favorites`(로컬)의 대칭. (후보 유지 — 별도 룰 승격은 선택)
- 📤 **react-virtual 스크롤 리셋 = `key` 재마운트** (F-12) — **반영 완료**: `react.md` "가상 스크롤·앱셸" 절. 명령형 `scrollTo(0)`/`scrollToOffset(0)`은 persistent virtualizer의 offset 복원으로 실패 → 리스트 `key` 재마운트.
- 📤 **prop 바뀌면 상태 리셋 = `key` 또는 render-time `useState`(ref ❌)** (F-18) — **반영 완료**: `react.md`(32) + `anti-patterns.md`(RX-15). SearchField는 이 패턴으로 **key 제거**(로고·뒤로가기·검색 실행 시 입력 초기화). ref로 이전 값 저장은 `react-hooks/refs`에 걸리니 반드시 `useState`.
