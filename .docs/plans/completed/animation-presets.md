# animation-presets — framer-motion transition 프리셋 인프라

> 상태: ✅ 완료 (2026-07-09 ship) · book-search-app에서 분리(🔀, backlog F-14 역링크). 미체크 항목은 skip/defer 결정·Pre-mortem 기록(잔여 작업 아님)

## 목표

framer-motion 기반 재사용 transition 프리셋을 `src/lib/animation/`에 확립하고 도서 검색 앱 적용 후보를 문서화한다. **실제 컴포넌트 적용은 하지 않아** 병렬 세션(Figma 검증·찜 목록)과 파일 충돌 0.

## 배경

- 왜: 검색 결과 등장·아코디언·팝오버·토스트 등에 매끄러운 전환 필요(UX, 성능 평가축의 "체감 품질")
- 왜: 매번 컴포넌트마다 framer-motion 값을 손으로 쓰면 일관성·재사용성 저하 → 프리셋으로 SOT화(평가 기준 ① 재사용 설계)
- 실제 필요: 지금은 **인프라만** 확립. 실제 적용은 홈/찜 세션이 안정화된 뒤 프리셋을 import(충돌 회피)

## 요구사항

- WHEN 개발자가 컴포넌트에 등장/퇴장 애니를 넣을 때 THEN `import { animation } from "@/lib/animation/transition"` → `<m.div {...animation.fadeUp}>`
- WHEN hover 인터랙션이 필요할 때 THEN 프리셋 없이 Tailwind 클래스 직접(복잡하면 `index.css`) — interaction 프리셋은 **미구현**, 필요처만 후보로 체크 [U]
- framer-motion 번들 최소화: `LazyMotion` + `m` 컴포넌트 (단, provider 설치는 이번 세션 범위 밖 — 적용 가이드 To-Do)
- 병렬 세션 소유 파일(`App.tsx`/`main.tsx`/`DefaultLayout`/홈·찜 컴포넌트/styles) **무수정**

## 현재 상태

- web-vxt `packages/animation` 레퍼런스 분석 완료: `transition/`(framer-motion 프리셋+compose/toScroll) + `interaction/`(Tailwind hover 문자열) + 텍스트 이펙트 8종(**도서 앱 과함, 제외**). framer-motion `^12.34.0` 사용
- framer-motion 미설치. `src/lib/`엔 `api/`만 존재. 경로 별칭 `@/* → src/*`
- 워킹트리에 3개 세션의 미커밋 변경 혼재(`package.json`/`pnpm-lock.yaml` 이미 M — @tanstack/react-virtual 추가분)

---

## 체크리스트

### Phase 1: 프리셋 인프라 (신규 파일만 — 충돌 0) ✅

- [x] Step 1.1: framer-motion 설치
  - 작업: `pnpm add framer-motion@^12` → **12.42.2** 설치. `LazyMotion`/`m`/`domAnimation`/`domMax`/`AnimatePresence`/`motion` export 확인, `TargetAndTransition`은 `motion-dom` 정의를 framer-motion이 re-export
  - 검증: `pnpm check-types` 통과(`error TS` 0건) → import 경로 RISK 해소
- [x] Step 1.2: transition 프리셋 정의
  - 작업: `src/lib/animation/transition.ts` — 타입 `AnimationPreset`, 유틸 `compose`, atomic `fade`/`slideUp`/`slideDown`/`scaleUp`, combo `fadeUp`/`fadeDown`/`pop`. **선별 제외**: slideLeft/Right·scroll 프리셋·`toScroll`(적용 후보 없음 + 가상 스크롤 상충 — Simplicity First). 한국어 주석, no-barrel
  - 검증: `pnpm check-types` 통과 + `eslint transition.ts` exit 0
- [x] Step 1.3: 적용 후보 + interaction hover 체크 문서화
  - 작업: 아래 "적용 후보 매트릭스" 확정(컴포넌트·프리셋·소유 세션·hover 처리) + LazyMotion provider To-Do 명시
  - 검증: 매트릭스 7행 + interaction hover 체크 + provider To-Do 기재 완료

### Phase 2: 데모 검증 (독립 entry — App 무수정) ✅

- [x] Step 2.1: 독립 데모로 프리셋 육안 검증
  - 작업: `demo.html` + `src/animationDemo.tsx`(로컬 `LazyMotion features={domAnimation}` 래핑, 프리셋 7종 렌더). `App.tsx`/`main.tsx`/`vite.config.ts` 무수정
  - 검증: `localhost:3000/demo.html` HTTP 200. Playwright 헤드리스 — 카드 **7종 전부 렌더**, 각 `initial`→`animate` 완료(opacity 1·transform none), **콘솔 에러 0**, 스크린샷 확인
- [x] Step 2.2: 데모 정리
  - 작업: `demo.html` + `src/animationDemo.tsx` + 임시 검증 스크립트 삭제 — `transition.ts`만 잔존
  - 검증: `git status`에 데모 파일 없음, animation 신규는 `src/lib/animation/`뿐

### Phase 3: 실제 적용 (1번 세션 완료 후 — 홈/공용만, 찜은 세션2 진행 중이라 제외) ✅

> AP 매트릭스(backlog) 기준. 실코드 확인 결과 리스크/중복 4건 스킵(아래 "결정 사항").

- [x] Step 3.1: LazyMotion provider — `App.tsx`에서 `<LazyMotion features={domAnimation} strict>`로 RouterProvider 래핑(`m.*` 강제 → 번들 최소화)
  - 검증: 홈 로드 콘솔 에러 0
- [x] Step 3.2: AP-6 빈 상태 `fade` — `EmptyState` 루트 `<m.div {...animation.fade}>`
- [x] Step 3.3: AP-3 히스토리 `fadeDown` — `SearchField` 히스토리 `<m.ul {...animation.fadeDown}>`
- [x] Step 3.4: AP-4 팝오버 `fadeDown` — `DetailSearchPopover` 루트 `<m.div ref {...animation.fadeDown}>`(useOutsideClick ref 유지)
  - 검증: `check-types` 0 + `eslint --fix` 0 + Playwright(팝오버 렌더 1, 콘솔에러 0, 스크린샷 육안)
- [x] Step 3.5: AP-3/4 dropdown 개선(A-7) — `dropdown` 프리셋 신설(y:-8, 0.18s, exit) + `AnimatePresence`. 히스토리·팝오버 교체
- [x] Step 3.6: AP-2 아코디언(A-8, 재도전) — `BookListItem`·`FavoriteBookItem` 루트 `<m.div animate={{height: isOpen?"auto":100}}>`(overflow-hidden, `initial={false}`). measureElement가 트윈 추적 → 부드럽게. 홈 검증(열림·콘솔0)
- [ ] Step 3.7 (스킵/이연): AP-1(리스트 등장, virtualizer translateY 충돌)·AP-5(Toast CSS 중복) 스킵, AP-9 후순위. 찜 통합 검증은 세션2 완료 후

### 최종 검증 ✅

- [x] `pnpm check-types`(`error TS` 0) / `eslint transition.ts`(exit 0)
- [x] 데모 육안 확인(스크린샷 — 카드 7종 정상)
- [x] `git status`로 충돌 0 증명 — 내 소스 수정 = `src/lib/animation/transition.ts` 1개. 홈/찜/App 무수정
- [ ] 커밋 — ⚠️ **병렬 세션 충돌로 보류**(아래 "발견 사항")

---

## 적용 후보 매트릭스 (이번 세션은 문서화만 — 적용은 각 세션 몫)

| 적용처 | 프리셋 | 소유 세션 | 비고 |
|---|---|---|---|
| 검색 결과 아이템 등장 | `fadeUp` | 홈(Figma)/찜 | 가상 스크롤 — entry(animate)만, whileInView 지양 |
| 상세보기 아코디언 확장/축소 | `AnimatePresence` + height/`fade` | 홈 | height auto 애니 주의(layout) |
| 히스토리·상세검색 팝오버 등장 | `fadeDown` 또는 `pop` | 홈(Figma) | |
| Toast 등장·퇴장 | `slideUp`+`fade`(=`compose`) | 공용(components) | AnimatePresence 필요 |
| 빈 상태(EmptyState) | `fade` | 홈/찜 | |
| 하트 찜 토글 | `pop`/`scaleUp` | 찜 | 클릭 피드백 |
| 페이지 전환 | `fade` | 라우트/DefaultLayout | LazyMotion provider 필수 |

**interaction hover 체크(프리셋 미구현)**: 카드/버튼 hover는 Tailwind 직접 — 예 `transition hover:border-primary`. 페이지 수가 적어 상수화 불필요. 반복·복잡 hover가 생기면 `index.css` 유틸로. 지금 필수 후보 없음.

**LazyMotion provider To-Do**: 실제 적용 세션이 앱 루트(`App.tsx` 또는 `main.tsx`)에 `<LazyMotion features={domAnimation}>` 1회 래핑 후 `motion.*` 대신 `m.*` 사용. 이번 세션은 충돌 회피로 미설치.

## 수정 파일 목록

| 파일 | 작업 |
|---|---|
| `package.json`, `pnpm-lock.yaml` | framer-motion 추가 |
| `src/lib/animation/transition.ts` | 신규 |
| `demo.html`, `src/animationDemo.tsx` | 임시 생성 → 삭제 |
| `.docs/plans/animation-presets.{md,backlog.md}` | 신규(plan 쌍) |

## 실패 위험 (Pre-mortem)

- [ ] 다른 세션과 동시 `pnpm add` → `pnpm-lock.yaml` 충돌. 설치 순간만 단독 보장(사용자 조율)
- [ ] framer-motion v12 API 변화 — `LazyMotion`/`domAnimation`/`m` import 경로를 공식 문서/이슈로 확인(external-docs 룰)
- [ ] scroll(whileInView) + 가상 스크롤 상충 → scroll 프리셋 보류로 회피
- [ ] provider 미설치 상태에서 누군가 `m.*` 적용 시 애니 무동작 → 적용 가이드 To-Do로 명시, 이번 세션 데모는 로컬 provider로 검증
- [ ] 데모 파일 삭제 누락 → Step 2.2 + 최종 `git status` 게이트로 방지

## 결정 사항

- **스코프: 인프라 + 데모만, 실제 적용 X** — 병렬 세션 충돌 0 [U 2026-07-08]
- **interaction 프리셋 미구현** — Tailwind 클래스 직접/`index.css`, 필요 hover만 후보 체크 [U 2026-07-08]
- **transition 프리셋만, 필요분 선별** — 텍스트 이펙트 8종 제외, scroll 프리셋 보류 [U + Simplicity First]
- **LazyMotion provider 이번 세션 미설치** — App 루트 무수정(충돌 0), 적용 가이드 To-Do로 이연
- **framer-motion `^12`** — web-vxt 정합, 사용자 도입 의사 [U 2026-07-08] (실설치 12.42.2, 홈 세션 `da35b29`에 함께 커밋됨)
- **적용 스코프 = 홈/공용만** [U "AP 전체 적용" + 실코드 판단 2026-07-08]: 1번(홈) 세션 커밋 완료 → 홈 파일 안전. 찜(2번) 세션 진행 중이라 AP-7·8 대기
- **AP-1 스킵 / AP-2 적용**(A-8 재도전): AP-1(리스트 등장 fadeUp)은 virtualizer `translateY`와 y축 충돌 + 스크롤마다 재생 → 스킵. AP-2(아코디언)는 `height 100↔auto`가 실제 DOM 높이를 연속 변경해 `measureElement`(ResizeObserver)와 오히려 잘 맞물림 → 홈·찜 적용
- **`dropdown` 프리셋 신설**(A-7): 페이지용 `fadeDown`(y-24/0.4s)은 드롭다운에 부자연스러움 → `dropdown`(y-8/0.18s ease-out-expo + exit). 히스토리·팝오버 공용
- **AP-5 스킵**: `ToastItem`에 이미 `toastVariants({exiting})` CSS 애니 존재 → framer 교체는 중복(Surgical Changes 위반)
- **LazyMotion + `strict` + `m.*`**: `motion.*` 대신 `m.*`만 사용해 domAnimation feature만 번들(성능 평가축). provider는 `App.tsx` RouterProvider 래핑

## 발견 사항 / backlog

- **커밋(2026-07-08 갱신)**: framer-motion이 홈 세션 `da35b29`에 이미 커밋되어 **lock 파일 충돌 해소**. 이제 본 세션 파일만 선택적 커밋 가능 — `src/lib/animation/transition.ts`, `src/App.tsx`, `src/pages/home/components/{EmptyState,SearchField,DetailSearchPopover}.tsx`, plan 2개. 찜 세션(2번) 파일(`favorites/*`·`useFavorites.ts`·`Header.tsx`)은 **제외**(git add 시 명시적으로 골라야 섞이지 않음). 커밋 실행 여부는 사용자 확인.

→ `.docs/plans/animation-presets.backlog.md`

## 컨벤션 변경 필요

- (진행 중 기록 — `src/lib/animation/` 신설이 규칙에 반영될지 /review에서 판단)
