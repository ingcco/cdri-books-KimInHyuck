# test-strategy backlog

> plan(`test-strategy.md`)의 피드백 원장(ledger). 모든 피드백을 여기 먼저 기록 후 라우팅. plan과 짝으로 ship까지 누적 — 길 잃지 않기 위한 SOT.
> 관련: 메인 앱 빌드는 `book-search-app.md`, 훅 재배치는 `hooks-restructure.md`(진행 중). 본 plan은 그와 독립적인 테스트 전략 수립.

## 상태 범례

- ✅ 반영 완료 (현재 plan에 박힘)
- 🔀 분리됨 (→ 별도 plan, 사용자 명시 시 즉시)
- ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)
- 💡 컨벤션 개선 후보 (규칙 승격 — /review에서 반영 판단)

## 피드백 원장

| # | 받은 피드백 | 주제 | 라우팅 | 상태 |
|---|---|---|---|---|
| F-1 | e2e가 src 형제 폴더인데 일반적 구조가 맞나 | on | Phase 1 폴더 관례 확정(e2e 형제=표준, unit co-location, integration 중앙집중) | ✅ |
| F-2 | 의미있는 테스트인지 보여주기인지 모르겠다 / unit·e2e·integration 각각 뭘 해야 옳은가 | on | 리스크 기반 재정의 + 레벨별 리스크 지도(plan 요구사항·현재상태) | ✅ |
| F-3 | 있는 스펙 전수 커버 vs 핵심만 / 커버리지 맞추다 끝날 것 같다 | on | 결정: 리스크 집중 + 3레벨 대표(커버리지 비목표). toComma 등 의도적 제외 명문화 | ✅ |
| F-4 | 과제 본질에서 뭘 어떻게 보여줘야 하나 | on | Phase 5 README 테스트 전략 문단(판단 근거 = 최고 고효율 산출물) | ✅ |
| F-5 | (발견) 세션 중 hooks-restructure가 동시 진행 — useFavorites→`src/lib/favorites/`(순수 favorites.ts 분리), useSearchHistory→`src/pages/home/hooks/`로 이동. 제 co-location 테스트도 소스 따라 자동 relocate됨 | on | Phase 2 경로/타깃 갱신(찜은 순수함수로 retarget = 오히려 개선). 작업트리에 두 plan 변경 혼재 → **ship 시 커밋 분리 필요** | ✅ |
| F-6 | README 아직 없음 → Phase 5(테스트 전략 문단)는 다음 플래닝(README 작성)에서 | on | Phase 5 ⏸️ 보류로 마킹. README 전체는 별도 plan 후보 | ✅ |
| F-7 | 왼쪽 세션(hooks-restructure) 끝나면 테스트 코드 변경 필요한지 재점검 | on | Phase 6 ⏸️ 대기 추가(최종 diff 기준 test 타깃 재확인) | ✅ |
| F-8 | ship 시 "테스트 커버리지 변경이 필요한 코드를 건드렸는지" 체크하는 .claude hook — 건드린 경로에 따라 재점검 레벨이 달라짐 | off→구현 | `.claude/skills/ship/scripts/test-impact.mjs` 신설 + ship SKILL.md Step 1.5 게이트 통합. 경로→레벨 매핑, REVIEW는 비강제 리마인드(exit 1). 현재 트리 OK·api.ts 유발 REVIEW·복원 OK 3케이스 검증 | ✅ |
| F-9 | (Phase 6 재점검) 왼쪽 세션 clear 버튼 추가로 journey 상호배타 e2e 회귀 — `getByLabel` substring 충돌 | on | `getByRole("searchbox")` 교체로 수정. 3레벨 전부 그린 재확인 | ✅ |
| F-10 | useInput.test.ts·price.test.ts가 왜 `__tests__` 안 쓰고 소스 옆? 일반적인가? 내용도 작은데? | on | 설명: unit co-location = 프론트 주류(내 Phase 1 결정, plan 승인). 작은 크기 = 리스크 기반 의도. 진짜 문제는 unit(소스옆)/integration(__tests__) 혼재 일관성 → F-11 | ✅ |
| F-11 | 일반적 케이스와 추천 방향? → co-location 통일 결정 | on | Phase 7 완료: integration 2개 `git mv`로 `src/lib/api/books/` 옆에, MSW 인프라 `src/test/`, config·폴더 정리. 3레벨 그린 | ✅ |
| F-12 | (발견) test-impact.mjs가 eslint no-undef 에러(console/process) — `.mjs`가 브라우저 globals 블록 밖 | on | eslint ignore에 `.claude/**` 추가(하네스=앱 lint 대상 아님). lint 0 errors | ✅ |
| F-13 | playwright.config.ts `use.reducedMotion` 타입 에러(ts2769) | on | 이 PW 버전은 `contextOptions.reducedMotion`으로 받음 → 이동. e2e-parity.md 룰도 동기화 | ✅ |
| F-14 | (발견) `check-types`가 이 에러를 못 잡음 — `e2e/**`·`playwright.config.ts`가 tsconfig 밖 | on | `tsconfig.e2e.json`(lib DOM) 신설 + root references 연결. probe로 e2e가 실제 체크됨 실증 | ✅ |
| F-15 | 의미없는 테스트 파일 삭제 | on | 진단 잔재 `scratchpad/diag.spec.ts` + 산출물 `test-results/`(gitignore 대상) 삭제. `_align.spec.ts`는 왼쪽 세션이 이미 정리. e2e/unit은 전부 실제 테스트 | ✅ |

## ⏳ 별도 plan 후보 (off-topic — ship 시 분리 검토)

| # | 피드백 | 이유 | 분리 시점 |
|---|---|---|---|
| F-6 | README 전체 작성(라이브러리 선택 이유·트레이드오프·실행법·Lighthouse·AI 협업 + 테스트 전략 문단) | 제출물 핵심 문서, 큰 산출물 | 다음 플래닝 |
| F-8 | ship 시 테스트 영향 감지 hook (경로→레벨 매핑) | 하네스 자동화 레이어(harness-up 성격) | 왼쪽 세션 종료 후 |

### F-8 설계 초안 (테스트 영향 감지 — 경로별 레벨 매핑)

git diff 변경 파일 → 대응 테스트 레벨을 매핑, "리스크 계층을 건드렸는데 대응 테스트 미변경"이면 ship 시 확인 프롬프트. **모든 파일에 테스트 강제 아님**(리스크 원칙 유지).

| 건드린 소스 | 재점검 레벨 | 근거 |
|---|---|---|
| `src/lib/api/**/api.ts`·`api.queries.ts` | integration | 카카오 경계 계약 |
| `src/lib/favorites/favorites.ts`·`src/utils/{price,number}.ts`·순수 훅 | unit | 비자명 순수 로직 |
| `src/pages/**/*.tsx`·`src/components/**`·라우팅 | e2e | 사용자 여정·인터랙션 |
| `*.style.ts`·순수 프레젠테이션·상수 | skip | 테스트 저가치 |

- **구현 형태: (b) `/ship` 커밋 직전 단계로 확정** (2026-07-09). 근거: 이 레포는 커밋을 `/ship`이 수행 → ship 시점 = 커밋 확정 게이트. (a) `PreToolUse`(git commit)는 husky pre-commit 레이어와 중복 + WIP/수동 커밋마다 발동해 개발 중 계속 오탐("헛돎"). b는 ship 전까지 조용 → 게이트가 딱 한 번.
- **출력**: 경고가 아니라 "이 파일들 바꿨는데 {레벨} 테스트 미변경 — 의도?"로 재점검 리마인드(리스크 원칙상 강제 실패는 과함).
- 관련: `harness-up` 스킬, `.docs/spec/requirements.md` 레벨 태그(u/i/e)가 이미 경로별 레벨의 SOT 역할.

## 💡 컨벤션 개선 후보

- **테스트 파일 3분 네이밍 규약**: `*.test.ts`(unit·co-location) / `*.integration.test.ts`(integration·중앙집중) / `*.spec.ts`(e2e). Phase 1 확정 후 재사용 가치 있으면 `conventions.md` "테스트" 절에 승격 (/review에서 판단)
- **"리스크 기반 테스트 선정" 원칙**: 커버리지 비목표 + "틀렸을 때 비용 큼 ∧ 로직 비자명"만 테스트. 반복 적용 시 `karpathy-principles.md` 또는 테스트 룰로 승격 후보
