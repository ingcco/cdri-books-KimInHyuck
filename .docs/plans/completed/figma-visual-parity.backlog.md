# figma-visual-parity backlog

> plan(`figma-visual-parity.md`)의 피드백 원장(ledger). 모든 피드백을 여기 먼저 기록 후 라우팅. plan과 짝으로 ship까지 누적 — 길 잃지 않기 위한 SOT.

## 상태 범례

- ✅ 반영 완료 (현재 plan에 박힘)
- 🔀 분리됨 (→ 별도 plan, 사용자 명시 시 즉시)
- ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)
- 💡 컨벤션 개선 후보 (규칙 승격 — /review에서 반영 판단)

## 피드백 원장

| # | 받은 피드백 | 주제 | 라우팅 | 상태 |
|---|---|---|---|---|
| F-1 | Figma 실측으로 전부 체크해 .docs/design 기준 px 정합 + 기획서 체크 + 모든 시각 부분 점검, 이후 Playwright로 UI 정합 | on | 현재 plan 전체(Phase A~C) | ✅ |
| F-2 | 반응형 미고려, Figma 1920×1080 기준으로만 진행 | on | plan 요구사항/결정 사항 | ✅ |
| F-3 | Playwright 검증 = DOM 실측 assertion | on | Phase C | ✅ |
| F-4 | requirements.md도 Figma 파란밴드 원문 + **코드 의도적 추가 감사**로 정확화 → unit/e2e 기준 문서화 | on(F-1 "기획서 체크" 연장) | requirements.md 재작성([F]/[N]/[판단]/[추가]+AC/레벨) | ✅ |
| F-5 | 분류 확정: 스켈레톤=계획했으나 **의도적 제외**(API 빠름) / 반응형=**제외**(1920 고정) / 무한스크롤=**react-virtual** 확정 | on | requirements.md §8·§2·§7-5 | ✅ |

## 발견 사항 (Phase A/B 재검증)

- **이미 정합이던 항목**(수정 불필요, 근거만 확정): 카운트 "총 N건" 숫자 primary(per-char override로 확인) · 팝오버 드롭다운 borderless+underline(Dropdown 트리거가 이미 `border-b #D2D6DA body2-bold`) · count→list 36px(gap-9) · 검색 pill 480×50.
- **주요 수정**: Header 탭 gap 32→56·inactive 색 subtitle→#353C49·언더라인 2px→1px / 검색 아이콘 20→30(글리프 20) / BookListItem collapsed pad-left 16→48·썸네일→제목 24→48 / expanded pad-left→54·상세보기 240→115·소개 본문 색 secondary→primary·가격 gap-1→2 / 팝오버 pad 16→24·close 24→20 / EmptyState gap 16→24 / 찜 h1 색·리스트 full-width.
- **동시 작업 병합**: Header/BookListItem/FavoriteBookItem에 병렬 애니메이션 작업(useCollapse·layoutId 언더라인·m.div 래핑)이 인입됨 — 본 정합 className과 충돌 없이 공존(typecheck/e2e green). 헤더 1px 언더라인은 애니메이션 layoutId 슬라이드로 구현됨.
- **미커버**: expanded(210×280 등)·history 드롭다운은 e2e 단언 미포함(collapsed·popover·empty·header·search·count·favorites만 게이트). 필요 시 확장.

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없으면 절 유지 — off-topic 발견 시 추가) | | | |

## 💡 컨벤션 개선 후보

- 드롭다운 borderless+underline variant 승격 여부(팝오버 전용 스킨 → formal variant?)
- Playwright DOM 정합 테스트 패턴을 규칙(`.claude/rules`)으로 룰화할지
