# readme-doc

> 상태: 🔵 진행 중

## 목표

제출용 `README.md`를 4개 평가기준(재사용 컴포넌트·가독성/유지보수·상태관리/API·성능)의 증거로 읽히게, "간략하되 핵심은 다 잡히게" 작성한다. Claude 통제 궤적은 `PROCESS.md`로 분리해 어필.

## 배경

- 왜: 제출은 GitHub Public Repo + README 필수 5섹션(개요·실행·구조·라이브러리 근거·강조 기능)
- 왜: 평가자가 `.env`를 이메일로 받아 직접 실행 → 스크린샷 불필요, "바로 실행" 경로가 최상단
- 왜: "그쪽도 Claude 사용" → AI 통제 능력은 감점 리스크 없이 차별화 포인트
- 실제 필요: 5섹션을 유지하되 4평가기준 ↔ 섹션 매핑 + Claude 협업 서사

## 요구사항

- WHEN 평가자가 레포 진입 THEN README.md가 랜딩에 렌더 (readme.html 미채택)
- WHEN 각 필수 섹션을 읽음 THEN 4개 평가기준 중 최소 1개의 증거가 그 안에 있음
- WHEN 도식이 필요 THEN GitHub 네이티브 Mermaid로 (데이터 3계층 1개)
- WHEN 깊은 근거가 필요 THEN `<details>` 접기 또는 `PROCESS.md` 링크 (본문 스크롤 짧게)
- WHEN 보안 트레이드오프 THEN 독립 섹션 없음 (.env 이메일 제출이라 사족) — CLAUDE.md 불변식 3번째 줄 완화

## 현재 상태

- README.md 없음 (신규). `.env`는 gitignore + git 미추적(불변식 유지)
- 스택: Vite+React19 CSR / react-router v8 / RQ v5 / nuqs / Tailwind v4+tv / axios / framer-motion v12 / react-virtual / Vitest+MSW / Playwright / pnpm
- 데이터 3계층: `lib/api/index.ts`(axios) → `books/api.ts`+`api.interface.ts` → `api.queries.ts` / `shared/{queryKeys,request,response,classifyQueryError}`
- 페이지 수직 슬라이스: home·favorites·error·notfound
- 과정 산출물: `.docs/plans/` 6쌍(완료 3) + 14 커밋

## 다이어그램

README 내부에 Mermaid 데이터 3계층 flowchart 1개만 (과잉 금지).

---

## 체크리스트

### Phase 1: 골격 + 정확도

- [x] Step 1.1: 목차 확정 반영 (실행→개요→스택→구조→강조→테스트→AI협업)
  - 검증: 5개 필수 섹션 전부 포함 + 아이콘 없음 → grep 확인 완료
- [x] Step 1.2: 실측 사실만 기입 (스크립트·의존성·트리·API 파라미터)
  - 검증: package.json·src 트리와 1:1, 할루시네이션 0

### Phase 2: 작성

- [x] Step 2.1: README.md 작성 (Mermaid 3계층 + `<details>` 접기 + 평가기준 매핑)
  - 검증: 코드펜스 균형(10, 짝수), 심화 `<details>` 처리
- [x] Step 2.2: PROCESS.md 작성 (planning→review→ship 게이트, rules, plan 6쌍, 14커밋 서사)
  - 검증: "통제 방법론" 톤 + 덜어냄의 기록
- [x] Step 2.3: CLAUDE.md 보안 불변식 완화 (README 명시 의무 폐기, 키/커밋 불변식 유지)
  - 검증: 나머지 2개 불변식 온존 확인

### 최종 검증

- [x] 마크다운 구조 확인 (Mermaid·details·표) — 코드펜스 균형 OK
- [x] 링크 유효성 (PROCESS.md 존재, 카카오 키 발급 외부 링크)
- [x] `.env` 미추적 불변식 유지 확인
- [ ] Lighthouse 실측값 기입 (사용자 실행 or /review-ui — 현재 placeholder)

---

## 수정 파일 목록

| 파일 | 작업 |
| --- | --- |
| README.md | 신규 생성 |
| PROCESS.md | 신규 생성 |
| CLAUDE.md | 보안 불변식 3번째 줄 완화 |

## 결정 사항

- readme.html 미채택: GitHub 랜딩은 .md만 렌더, Mermaid로 도식 대체 (PAAR)
- 스크린샷/GIF 미포함: 평가자 직접 실행 + 배포 없음
- Lighthouse: 수치 표 + 측정 조건, "최적화 항목 먼저 → 점수는 결과" 서사
- 테스트: 커버리지% 없이 3층 전략 서술
- 보안 트레이드오프 섹션 삭제 + CLAUDE.md 불변식 완화 (F-6)
- Claude 협업 섹션: README 짧게 + PROCESS.md 분리 (그쪽도 Claude 사용 → 강점)

## 발견 사항 / backlog

→ `.docs/plans/readme-doc.backlog.md`

## 컨벤션 변경 필요

- CLAUDE.md 보안 불변식: "README 트레이드오프 명시 의무" → 삭제 (이번 작업에 포함)
