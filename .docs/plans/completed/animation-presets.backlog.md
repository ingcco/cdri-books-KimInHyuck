# animation-presets backlog

> plan(`animation-presets.md`)의 피드백 원장(ledger). 모든 피드백을 여기 먼저 기록 후 라우팅. plan과 짝으로 ship까지 누적 — 길 잃지 않기 위한 SOT.
> 분리 출처: `book-search-app.backlog.md` F-14 (🔀 별도 plan).

## 상태 범례

- ✅ 반영 완료 (현재 plan에 박힘)
- 🔀 분리됨 (→ 별도 plan, 사용자 명시 시 즉시)
- ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)
- 💡 harness-up 후보 (룰/스킬 승격)
- 📤 승격됨 (SOT 위치 기록)

## 피드백 원장

| # | 받은 피드백 | 주제 | 라우팅 | 상태 |
|---|---|---|---|---|
| A-1 | web-vxt `packages/animation` 기준 transition 정도의 간단한 애니메이션 중 적용할 것 체크해 가져가자. framer-motion(react-framer) 설치 예상. 구조는 `src/lib/animation/index.ts` 어떻냐 (2026-07-08) | on | Phase 1 — 단, `index.ts` barrel 대신 `transition.ts`로(성격 분리·no-barrel). 텍스트 이펙트 8종 제외 | ✅ |
| A-2 | 스코프는 1번(인프라+데모 검증, 실제 적용 X → 충돌 0)으로 (2026-07-08) | on | plan 전체 스코프 확정, Phase 1~2 | ✅ |
| A-3 | interaction은 하지 말 것 — 페이지 적어 Tailwind 클래스 직접, 복잡하면 `index.css`. 필요하면 프리셋만 체크 (2026-07-08) | on | interaction 프리셋 미구현, plan "적용 후보 매트릭스"에 hover 체크 문서화만 | ✅ |
| A-4 | 클로드 세션 3개 병렬(1.Figma 검증 2.찜 목록 3.애니메이션=본 세션) — 다른 것 최대한 안 꼬이도록 체크 (2026-07-08) | on | 신규 파일만 생성·데모 독립 entry·소유 파일 무수정으로 충돌 0 설계. Pre-mortem에 pnpm lock 조율 기록 | ✅ |
| A-5 | 커밋은 1번 세션(디자인 수정) 완료 후 함께 적용. 지금은 **어디에 어떤 애니메이션 적용할지 체크만 해서 backlog에 남겨달라** — 추후 진행 (2026-07-08) | on | 자동 /ship 보류(A-4 lock 공유). 아래 "🎬 애니메이션 적용 후보" 절에 컴포넌트별 프리셋 체크리스트 신설 | ✅ |
| A-6 | 1번 세션 완료 확인 → **AP 전체 적용** 지시 (2026-07-08) | on | 실코드 확인 후 AP-3/4/6 적용·검증(fadeDown/fade + LazyMotion provider). AP-1/2/5는 가상스크롤·기존 CSS 애니 충돌로 스킵 권고, AP-7/8은 찜 세션(2번) 진행 중이라 대기, AP-9 후순위 | ✅(부분 적용) |
| A-7 | 검색창(히스토리 드롭다운) 애니가 아쉽다·자연스럽지 않다 (2026-07-08) | on | 진단: `fadeDown`은 페이지 진입용(y:-24, 0.4s, exit 없음)이라 드롭다운에 부적합. → `dropdown` 프리셋 신설(y:-8, 0.18s ease-out-expo, exit 포함) + `AnimatePresence`로 닫힘까지. 히스토리·팝오버 dropdown으로 교체. 검증(렌더1·콘솔0) | ✅ |
| A-8 | 상세보기 아코디언(도서검색+내가 찜한 책)이 부드럽게 안 열리고 레이어가 팍 튄다 (2026-07-08) | on | **AP-2 재도전**(앞서 스킵). `BookListItem`·`FavoriteBookItem` 루트를 `<m.div>` + `animate height 100↔auto`(overflow-hidden, `initial={false}`) — virtualizer `measureElement`가 트윈 추적(정상 확인). 홈 검증(열림·콘솔0). 찜은 세션2 파일 | ✅ |
| A-9 | 여전히 뚝뚝 끊긴다·왜 부자연스럽나·Playwright로 체크 가능한가 (2026-07-08) | on | **Playwright rAF 프레임 진단**(열린 li 높이 시간축 샘플). 원인=measureElement 아님(다음 아이템 프레임 단위 동기), `ease-out-expo [0.16,1,0.3,1]`가 230px 큰 변화에 급가속(첫프레임 108px). → Material `[0.4,0,0.2,1]`/0.35s로 교체. 재측정: 첫점프 108→4px, 최대 108→30px, 종모양 20프레임 분포 | ✅ |
| A-10 | 열 때는 괜찮은데 닫을 때 아쉽다 + 적용 애니 전체 Playwright 조사 (2026-07-08) | on | 닫힘 프레임진단: 점프량 전부 0(즉시 닫힘) — 콘텐츠 즉시 교체로 framer가 `auto`를 collapsed(100)로 오측정. → `src/hooks/useCollapse.ts`(상세를 트윈 동안 유지, `onAnimationComplete` 후 언마운트) 홈·찜 적용. 재측정: 닫힘 329→100 20프레임 종모양(최대 30px), 열림과 대칭 | ✅ |
| A-11 | 헤더 링크(도서검색/내가 찜한 책) 활성 밑줄이 좌우로 슬라이드하면 좋겠다 (2026-07-08) | on | framer `layoutId="nav-underline"` 공유 밑줄(spring). layout feature 필요 → `App.tsx` LazyMotion `domAnimation`→`domMax`. Header(세션2 소유). 검증: 밑줄 x 767→901 17프레임 slide, pageerror 0 | ✅ |
| A-12 | 상세보기 펼칠 때 fade-in/닫을 때 fade-out 추가 + 닫을 때 구매하기 버튼 갑툭튀·흔들림 제거 (2026-07-08) | on | expanded/collapsed div를 `m.div` opacity 애니로 — expanded `opacity 0→(isOpen?1:0)`(펼침 fade-in/닫힘 fade-out, 0.25s), collapsed `0→1`(교체 시 fade-in). `useCollapse`(높이 대칭) 유지. 홈·찜. 진단: 닫힘 opacity 1→0.78→0.5→0.27→0.1 + height 종모양 동시 진행 | ✅ |
| A-13 | 값 프리셋만 쓰고 싶다·`useCollapse` 훅 꼭 필요한가·framer AnimatePresence(조건부 렌더링)로는 안 되나 (2026-07-09) | on | 값 프리셋(`animation.*`)은 순수 유지 확인(훅 무관). **AnimatePresence(mode=wait) 실험** → 우리 아코디언은 요약↔상세 완전 교체(배타 레이아웃)라 둘 다 height 0에서 시작 = 열림 69→1→329·닫힘 329→1→69로 **중간 접힘=더 튐**(Playwright 진단). `useCollapse`(6줄, 콘텐츠 트윈 동안 유지)가 이 케이스 정답 → AnimatePresence 되돌리고 미사용 `accordion` 프리셋 제거 | ✅ useCollapse 유지 |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없음) | | | |

## 💡 harness-up 후보

| # | 내용 | 승격 위치 | 상태 |
|---|---|---|---|
| H-1 | framer-motion 프리셋 규약 — 값 프리셋(`animation.*`) + `LazyMotion`/`m`/`strict` + feature(domAnimation/domMax) 선택 (A-1~4, A-11) | `.claude/rules/animation.md` 신설 | 📤 승격됨 |
| H-2 | **값 프리셋 vs 상태 훅 경계** — 값은 프리셋, 렌더 상태 제어(콘텐츠 지연 언마운트)는 dedicated 훅(useCollapse). AnimatePresence 대체 시도→배타 레이아웃 부적합 실증 (A-13) | `.claude/rules/animation.md` | 📤 승격됨 |
| H-3 | ease/duration 가이드(작은 이동 expo / 큰 변화 Material) + 가상스크롤+아코디언 gotcha(measureElement 추적·height:auto 닫힘 오측정) (A-8~10, A-12) | `.claude/rules/animation.md` | 📤 승격됨 |
| H-4 | **Playwright 애니 정량 검증** — rAF 프레임별 값 샘플→점프량 종모양 판정, route mock/addInitScript (A-9~13) | `.claude/rules/animation.md` (+`/review-ui` 연동) | 📤 승격됨 |

## 미승격 제안 (사용자/통합 시 판단)

- `CLAUDE.md` 기술 스택 표 + README "라이브러리 선택 이유"에 **framer-motion(LazyMotion/m)** 추가 — A-2에서 승인된 스택이나, `CLAUDE.md`는 병렬 세션(harness) 소유·핵심 규약이라 통합 시점에 반영 권장

## 🎬 애니메이션 적용 후보 (추후 진행 — 1번 세션 디자인 완료 후)

> 인프라(`src/lib/animation/transition.ts`)는 완료. 실제 적용은 각 컴포넌트 **소유 세션이 안정화된 뒤** 아래대로 프리셋을 import해 진행한다. 병렬 수정 중이라 셀렉터/구조는 적용 시점에 재확인.
>
> **공통 선행조건**
> - 앱 루트(`App.tsx` 또는 `main.tsx`)에 `<LazyMotion features={domAnimation}>` **1회 래핑** → 이후 `motion.*` 대신 `m.*` 사용(번들 최소화)
> - 접근성: `useReducedMotion()`으로 감속 선호 시 애니 생략/축소 (Pre-flight RISK 반영)
> - 등장만이면 `initial`+`animate`, 퇴장까지면 부모를 `<AnimatePresence>`로 감싸고 `exit`

> **적용 결과(2026-07-08)**: ✅ AP-3·4·6 적용·검증 완료(fadeDown/fade + LazyMotion provider `App.tsx` strict, 콘솔에러 0). ⏭️ AP-1·2·5 스킵 — 가상스크롤(y·measureElement) 충돌·기존 CSS 애니 중복. ⏳ AP-7·8 찜 세션(2번) 대기, AP-9 후순위.

| # | 적용처 | 프리셋 | 방식 · 주의 | 소유 세션 | 권장 | 상태 |
|---|---|---|---|---|---|---|
| AP-1 | 검색 결과 리스트 아이템 등장 | `fadeUp` | ⚠️ 가상 스크롤 — virtualizer row는 스크롤 시 재마운트되어 **매번 재생될 수 있음**. 최초 로드분에만 적용하거나 절제(과하면 스크롤 방해). AnimatePresence 불필요 | 홈(세션1) | ★★ | ⏭️ 스킵(virtualizer translateY 충돌·스크롤 재생) |
| AP-2 | 상세보기 아코디언 확장/축소 | `AnimatePresence` + height | `<m.div initial={{height:0}} animate={{height:"auto"}} exit={{height:0}}>` + `overflow-hidden`. 단일 열림 로직은 `useHome` 유지 | 홈+찜 | ★★★ | ✅ 적용(A-8, m.div height 100↔auto — measureElement가 트윈 추적) |
| AP-3 | 검색 히스토리 드롭다운 | `fadeDown` | 등장 `fadeDown`(m.ul). 상태는 `useSearchInput`/`useHome` 소유 | 홈(세션1) | ★★ | ✅ 적용 |
| AP-4 | 상세검색 팝오버 | `fadeDown` 또는 `pop` | 등장 `fadeDown`(m.div, useOutsideClick ref 유지). | 홈(세션1) | ★★ | ✅ 적용 |
| AP-5 | Toast 등장/퇴장 | `fadeUp` | `AnimatePresence` + 큐 스택 각 항목. ~~완성 확인 후~~ **이미 `toastVariants({exiting})` CSS 애니 존재** | 공용(components) | ★★★ | ⏭️ 스킵(기존 CSS 애니 중복) |
| AP-6 | 빈 상태(EmptyState) 진입 | `fade` | 단순 페이드인(m.div fade). 홈 EmptyState 적용, 찜은 세션2 몫 | 홈/찜 | ★ | ✅ 적용(홈) |
| AP-7 | 하트 찜 토글 피드백 | `whileTap` + `pop` | 클릭 순간 `whileTap={{scale:0.8}}`, 채워짐 아이콘 등장에 `pop`. 세션2가 하트 재배치 중 | 찜(세션2) | ★★ | ⬜ |
| AP-8 | 찜 목록 아이템 등장 | `fadeUp` | 찜은 소량·클라 페이지네이션 → stagger(순차 지연) 여유 있음 | 찜(세션2) | ★★ | ⬜ |
| AP-9 | 페이지 전환(라우트) | `fade` | `DefaultLayout`/라우트 레벨 `AnimatePresence` + `useLocation().pathname` key. provider 필수 | 레이아웃 | ★ | ⏳ 후순위 |

**interaction hover(프리셋 미구현 — Tailwind 직접)**: 카드/버튼 hover는 `transition hover:border-primary` 등 클래스 직접. 반복·복잡해지면 `index.css` 유틸로. 현재 필수 후보 없음.

**우선 적용 추천순**: AP-2(아코디언) → AP-5(토스트) → AP-3/AP-4(팝오버·히스토리) → AP-1/AP-8(리스트) → AP-7(하트) → AP-6/AP-9. ★★★부터.
