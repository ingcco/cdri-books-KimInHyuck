# harness-session-codify — 세션 규칙 승격

> 상태: ✅ 완료 (2026-07-09 ship). harness-up(방법론만 차용, VXT 스킬 → cdri-books 치환).

## 목표

이번 세션의 F-13 ④~⑥(홈 슬라이스 재편·가상 스크롤·에러 처리)에서 **실제 검증한 아키텍처 패턴**을 `.claude/rules`에 codify. 병렬 찜 세션·향후 작업이 재유도 없이 일관되게 재현하도록.

## 요구사항 (승인된 제안 10 + 노트 1)

| # | 파일 | 변경 |
|---|---|---|
| 1 | page.md | [신규] 컴포넌트 분할 4신호 기준 |
| 2 | page.md | [확장] 공유=props / 페이지지역=context 조회 |
| 3 | page.md | [수정] `pageVariants` → `{Name}.style.ts`+`{name}Variants` 페이지도 통일 |
| 4 | react.md | [신규] 컴포넌트 무상태 원칙 + dedicated 훅 예외 (H-3 흡수) |
| 5 | react.md | [확장] ref를 Context value에 싣지 말 것 + 리셋은 key (H-4) |
| 6 | react.md | [확장] RQ v5 per-query onError 없음 → QueryCache+meta.errorMessage |
| 7 | react.md | [확장] Context 슬롯 UI 1:1 네이밍 (H-7) |
| 8 | anti-patterns.md | [신규 RX-15] ref-in-context / set-state-in-effect |
| 9 | anti-patterns.md | [보강] RX-12 keepPreviousData+??EMPTY (H-6) |
| 10 | conventions.md | [수정] 네이밍표 + tailwindcss/classnames-order off (H-5) |
| 11 | react.md | [노트] 가상화(useBookListVirtualizer)+앱셸 패턴 |

## 체크리스트

- [x] page.md #1(4신호) #2(공유=props/지역=context) #3(HomePage.style 네이밍) + frontmatter/tree 스테일 정리
- [x] react.md #4(무상태 원칙) #5(ref는 dedicated 훅) #6(v5 onError+meta) #7(Context 슬롯 네이밍) #11(가상화·앱셸)
- [x] anti-patterns.md #8(RX-15 신규) #9(RX-12 보강)
- [x] conventions.md #10(네이밍표 + Tailwind classnames-order off) + tree 주석 스테일 정리
- [x] backlog H-3~H-11 `📤 승격됨` 표기 (H-12=RX-13 완화는 미승격 보류)

## 결정 사항

- **/ship 미실행**: 찜 세션이 워킹트리 공유 + Figma 검수 미완 → 커밋은 전체 세션 ship 때 사용자 결정
- #11 가상화 패턴은 규칙이 아닌 **짧은 참조 노트**로 (앱 1개 리스트 전용)
- 외부 트렌드 조사 생략 (세션 codify 우선, 사용자 지시)

## Pre-mortem

- rules 파일 비대화(anti-patterns 790줄) → 추가는 **간결하게**, 기존 절 확장 우선
- 규칙 간 모순: `pageVariants` 통일 규칙을 여러 파일이 참조 → page.md·conventions.md 동시 갱신으로 정합 유지
