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
| F-4 | `add-dir`로 연결한 `web-vxt/apps/vxt-fashion-admin`(사용자가 최근에 깔끔하게 구성했다고 밝힌 프로젝트)을 툴링(husky/eslint 등) 참고 기준으로 활용할 것. "나중엔 add-dir 내용은 다 뺄 것" (2026-07-08) | on | ESLint/Prettier/Husky 구성 조사 후 PAAR 근거에 반영 완료. add-dir 참조는 세션 한정(레퍼런스일 뿐 코드 복사 아님) | ✅ |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| (없음) | | | |

## 💡 harness-up 후보

(빈 상태)

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
