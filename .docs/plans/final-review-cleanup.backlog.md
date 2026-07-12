# final-review-cleanup backlog

> plan(`final-review-cleanup.md`)의 피드백 원장(ledger). 모든 피드백을 여기 먼저 기록 후 라우팅. plan과 짝으로 ship까지 누적 — 길 잃지 않기 위한 SOT.

## 상태 범례

- ✅ 반영 완료 (현재 plan에 박힘)
- 🔀 분리됨 (→ 별도 plan, 사용자 명시 시 즉시)
- ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)
- 💡 컨벤션 개선 후보 (규칙 승격 — /review에서 반영 판단)

## 피드백 원장

| # | 받은 피드백 | 주제 | 라우팅 | 상태 |
|---|---|---|---|---|
| F-1 | 전체 레포 최종 검수 — 룰 정합·주석 제거·타레포명/민감정보·가독성/방어/공통/dead·eslint/ts·테스트 | on | 현재 plan 전체 | ✅ |
| F-2 | layout이 `.style.ts` 룰을 안 따른 것 같다 | on | Phase 3(검증 결과: 위반 아님, 진짜 위반은 `component/` 폴더명) | ✅ |
| F-3 | `.claude`·`.docs`까지 `//` 주석 다 제거 | on | Phase 1·2 (Q1~3 답변으로 범위 확정) | ✅ |
| F-4 | claude setting에 web-vxt/web-andrsen·민감정보 검수 | on | Phase 1 (14건 발견, 전부 .docs/.claude) | ✅ |
| F-5 | 가독성·불필요 방어·불필요 공통·안쓰는 파일 | on | Phase 3 (과방어 거의 없음, 미사용만 제거) | ✅ |
| F-6 | eslint/ts 오류 + 마지막 테스트 전부 | on | Phase 4 | ✅ |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없음 — 전부 on-topic) | | | |

## 💡 컨벤션 개선 후보

- **react.md 환경가드 룰 재검토**: react.md "브라우저 API 환경 가드"가 `typeof window === "undefined"` 가드를 코드 예시로 요구하나, 이 앱은 CSR 단독 + 테스트도 jsdom이라 dead branch(과방어). `localStorage.ts`는 JSON.parse try/catch만 채택(손상 데이터→fallback, 정확성). 룰의 SSR/node 전제 완화 후보.
- **가드 훅 사각지대**: `guard-source-hygiene.sh`가 `.docs`/`.claude`를 검사 제외하는데 정작 이 폴더들이 git tracked라 노출됨. 또 `web-vxt`/`VXT`가 패턴에 없어 사각지대. → 가드 스코프/패턴 재정의 후보 (이번 청소로 유입원 제거되면 우선순위 낮아짐)
- **소스 무주석 정책 자동 감사**: conventions.md의 "제출용 무주석" 정책을 커밋 훅 grep으로 강제할지 (Figma/react.md/날짜 마커)
