# 애니메이션 규약 — framer-motion 프리셋

framer-motion 기반 재사용 애니메이션의 정의·소비·검증 규약. `src/lib/animation/**`·애니 적용 컴포넌트 편집 시 참조.

## 스택 · Provider

- **framer-motion v12** + `LazyMotion` + `m` 컴포넌트로 번들 최소화. `motion.*` 대신 항상 `m.*`.
- App 루트 1회 래핑: `<LazyMotion features={domMax} strict>`. `strict`는 `motion.*` 사용을 컴파일 에러로 막아 `m.*`를 강제한다.
- **feature 선택**: 기본은 `domAnimation`(fade/slide/scale/spring). `layout`/`layoutId`/`drag`를 쓰면 `domMax`로 올린다(번들 소폭↑ 트레이드오프). 예: 헤더 활성 밑줄 슬라이드(`layoutId`)는 domMax 필요.

## 프리셋 = 값, 로직 = 훅 (핵심 경계)

재사용 애니는 **값 프리셋**으로 `src/lib/animation/transition.ts`에 정의하고 `{...animation.fade}`로 소비한다. 프리셋은 순수 값(`initial`/`animate`/`exit`)이며 `compose(...)`로 합성한다.

- **값으로 표현 가능** → 프리셋 (fade, dropdown, fadeUp, slide, pop 등). 소비처는 `<m.div {...animation.dropdown}>`.
- **컴포넌트 렌더 상태 제어** → dedicated 훅. 프리셋(값)으로 표현 불가한 것. 프로젝트의 `useSearchInput`·`useOutsideClick`·`useVirtualScroll`와 같은 층위.
  - 예: 아코디언 닫힘 시 "상세 콘텐츠를 height 트윈 동안 유지했다가 언마운트"(`useCollapse`)는 `showDetail` 렌더 상태 제어라 값 프리셋으로 불가능.

> **판단**: 새 애니를 넣을 때 먼저 "값 프리셋으로 되는가?"를 본다. 되면 프리셋, 렌더 상태가 개입하면 최소 훅. 훅을 만들었다고 프리셋 원칙이 깨진 게 아니다 — 층위가 다르다.

## ease · duration 가이드

| 상황 | ease | duration | 근거 |
|---|---|---|---|
| 작은 이동(드롭다운·팝오버 y≈8px) | ease-out-expo `[0.16,1,0.3,1]` | 0.18s | 경쾌한 등장 |
| 큰 높이 변화(아코디언 200px+) | Material standard `[0.4,0,0.2,1]` | 0.35s | expo는 큰 변화에서 첫 프레임 과속(뚝) |
| 밑줄·위치 슬라이드 | spring(stiffness 400, damping 32) | — | 자연스러운 정착 |

**교훈**: 같은 ease라도 이동량에 따라 체감이 다르다. ease-out-expo는 8px엔 좋지만 230px 높이 변화에선 첫 프레임에 절반이 가버려 "뚝" 열린다.

## 가상 스크롤 + 아코디언 gotcha

`@tanstack/react-virtual`(measureElement) 안의 아코디언 height 애니는 까다롭다.

- **동작 원리**: `height: 100 ↔ auto`를 framer가 애니하면 실제 DOM 높이가 연속 변하고, `measureElement`(ResizeObserver)가 이를 추적해 아래 아이템이 부드럽게 밀린다. (layout/transform 기반 애니는 실제 높이를 안 바꿔 measureElement가 못 잡으니 **height 실측 애니를 쓴다**.)
- **닫힘 함정**: 닫을 때 콘텐츠를 즉시 collapsed로 교체하면 framer가 `height: auto`를 collapsed 높이(100)로 **오측정** → 닫힘 트윈이 통째로 사라진다(즉시 닫힘). → `useCollapse`로 상세 콘텐츠를 트윈이 끝날 때까지 유지 후 `onAnimationComplete`에서 언마운트.
- **AnimatePresence는 배타 레이아웃 아코디언에 부적합**: "요약↔상세 **완전 교체**" 구조에서 `<AnimatePresence>{isOpen ? expanded : collapsed}` + height 프리셋은 둘 다 `height:0`에서 시작해 전환 시 중간에 거의 접힌다(열림 `69→1→329`). AnimatePresence 아코디언은 "**요약 고정 + 상세만 펼침**" 구조에서만 매끄럽다.

## Playwright 애니 검증 (정량)

애니 "자연스러움"은 스크린샷(정지)이 아니라 **시간축 샘플링**으로 측정한다.

- `page.evaluate` 안에서 `requestAnimationFrame` 루프로 애니 진행 중 **프레임마다 값**(높이/x좌표/opacity)을 샘플링 → 프레임 간 점프량 배열 분석.
- **판정**: 점프량이 **종 모양**(작게 시작 → 중간 최고속 → 작게 감속)이면 부드럽다. **첫 프레임에 큰 점프**(예: 108px)면 ease 과속, **전부 0**이면 애니 미동작(즉시).
- 결과 렌더가 필요하면 `page.route(/dapi\.kakao\.com/, …)`로 카카오 응답을 목킹한 뒤 인터랙션. localStorage 의존(검색기록·찜)은 `addInitScript`로 주입.
- `/review-ui`에서 애니 컴포넌트를 검증할 때 이 프레임 진단을 병행한다.

## 관련 룰

- `.claude/rules/react.md` — dedicated 훅·가상 스크롤·참조 안정성
- `.claude/rules/conventions.md` — no-barrel, 값 상수 위치
