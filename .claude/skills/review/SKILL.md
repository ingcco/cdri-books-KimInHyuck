---
name: review
description: 변경된 코드를 프로젝트 컨벤션 기준으로 리뷰합니다. 파일 유형별 조건부 체크리스트를 적용하고, 심각도별 점수를 산출하여 보고한 뒤 확인 후 수정합니다. 트리거 - "/review", "코드 리뷰", "리뷰해줘"
effort: max
---

# /review — 코드 리뷰 + 점수 산출 + 검증

변경된 코드를 파일 유형별 컨벤션 기준으로 체크하고, **점수 산출 → 보고 → 확인 → 수정** 순으로 진행하는 스킬. 상세 체크리스트는 `references/checklists/`에서 파일 유형에 맞게 lazy load (Progressive Disclosure).

## 트리거

사용자가 `/review`를 입력하면 실행.

---

## 점수 체계

### Severity 등급 (4단계)

| Severity     | 태그 | 감점 | 기준                                         | 예시                                    |
| ------------ | ---- | ---- | -------------------------------------------- | --------------------------------------- |
| **Blocking** | `B`  | -20  | 보안 취약점, 런타임 크래시, 데이터 손실 위험 | 입력 검증 누락, XSS, API 키 노출        |
| **Major**    | `M`  | -10  | 구조적 컨벤션 위반, 성능 이슈, 잘못된 패턴   | useEffect deps 3개, 파일 분리 미준수    |
| **Minor**    | `m`  | -3   | 네이밍, 정리 미비, 경미한 컨벤션 위반        | 시맨틱 변수명, 미사용 import, 매직 넘버 |
| **Nit**      | `n`  | -1   | 선호도 수준, 필수 아님                       | 코드 순서, 주석 스타일                  |

### 5차원 평가

| 차원                | 약어  | 매핑 대상                                          | 가중치 |
| ------------------- | ----- | -------------------------------------------------- | ------ |
| **Correctness**     | `Cor` | React Hook 규칙, SSR 안전성, API 패턴, 방어적 반환 | 0.25   |
| **Security**        | `Sec` | 보안 SOT (`security/SKILL.md` OWASP + 프로젝트 특화) | 0.30   |
| **Maintainability** | `Mai` | 구조, 네이밍, 정리, 재사용, JSDoc                  | 0.20   |
| **Consistency**     | `Con` | 파일 유형별 패턴 (3파일, Memo/Handler 등)          | 0.15   |
| **Performance**     | `Per` | deps 최소화, 참조 안정성, Memo/Handler 패턴        | 0.10   |

### 점수 산출

```
차원별 점수 = 100 - sum(해당 차원 위반 × severity 감점), 최소 0

종합 = (Correctness × 0.25) + (Security × 0.30) + (Maintainability × 0.20)
     + (Consistency × 0.15) + (Performance × 0.10)
```

### 등급

| 등급  | 점수   | 의미                       |
| ----- | ------ | -------------------------- |
| **A** | 90-100 | Ship-ready                 |
| **B** | 75-89  | 양호, minor 수정 권장      |
| **C** | 60-74  | major 이슈 있음, 수정 필요 |
| **D** | 40-59  | 여러 major, 반드시 수정    |
| **F** | 0-39   | blocking 이슈, ship 불가   |

### Quality Gate

```
통과 조건 (모두 충족):
  Blocking = 0건
  Security >= 80
  종합 >= 70
```

Gate 미달 시 → `/ship` 전에 반드시 수정 필요.

---

## 파일 유형별 체크리스트 라우팅 (Progressive Disclosure)

변경 파일의 경로로 아래 매핑 표에서 필요한 references만 선택적으로 로드한다. 모든 체크리스트를 한 번에 읽지 않음.

| 파일 유형         | 매칭 패턴                                    | 로드할 references                             |
| ----------------- | --------------------------------------------- | ---------------------------------------------- |
| **페이지**        | `src/pages/**/*Page.tsx`, `styles/page.style.ts` | `common.md` + `page-data.md` [페이지]       |
| **페이지 Hook**   | `src/pages/**/hooks/use*.ts`                 | `common.md` + `page-data.md` [페이지Hook]      |
| **API/데이터**    | `src/lib/api/**`, `src/lib/storage/**`       | `common.md` + `page-data.md` [API 모듈]        |
| **UI 컴포넌트**   | `src/components/**`                          | `common.md` [React]                            |
| **테스트**        | `__tests__/**`, `*.test.ts`, `*.spec.ts`     | `common.md` [테스트]                           |
| **기타**          | 그 외                                        | `common.md`                                    |

### references/ 구조

| 파일                                                                   | 다루는 범위                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------- |
| [`references/checklists/common.md`](./references/checklists/common.md) | [공통] 모든 파일 + [React] 컴포넌트/Hook 공통             |
| [`references/checklists/page-data.md`](./references/checklists/page-data.md) | [페이지] + [페이지Hook] + [API 모듈]        |

**사용 규칙**:

- 본 SKILL.md + `common.md`는 거의 항상 로드
- `page-data.md`는 `src/pages/` 또는 `src/lib/` 경로가 diff에 포함될 때만 로드
- 여러 유형이 섞인 PR은 여러 절 동시 참조 가능

---

## 실행 절차

### 0. 맥락 파악

리뷰 시작 전 `.docs/plans/` 아래 진행 중인 계획 문서가 있는지 확인.

```bash
ls .docs/plans/ 2>/dev/null
```

진행 중 `.md` 있으면 체크리스트·결정 사항·"컨벤션 변경 필요" 항목을 읽고 변경 의도를 파악한 뒤 리뷰.

### 1. 변경 파일 파악 + 분류

```bash
git diff --name-only
git diff --cached --name-only
```

변경이 없으면 "리뷰할 변경 사항이 없습니다" 출력 후 종료. 변경 파일을 위 라우팅 표에 따라 유형별로 분류하고 로드할 references 목록을 확정.

### 2. 변경 파일 읽기

각 파일의 전체 내용 + `git diff`로 변경된 부분을 확인.

### 3. 체크리스트 순회 + 점수 산출 (차원별 순차 패스 + 재현 검증)

단일 패스 내에서 차원별로 **순차 평가**하고 각 차원마다 독립 감점을 누적한다. **false positive 제거** 단계 포함.

#### 3.1 Correctness 차원 평가

- **담당 체크리스트**: React Hook 규칙, 브라우저 API 환경 가드(localStorage 등), API 패턴, 페이지 수직 슬라이스 패턴, 방어적 반환
- **Progressive Disclosure**: `common.md` [공통 + React], `page-data.md` [페이지/API] 중 해당 경로만 로드
- **감점 태그**: `[B·Cor]` -20, `[M·Cor]` -10, `[m·Cor]` -3, `[n·Cor]` -1
- **재현/검증** (Independent Verification):
  - 각 위반 발견 시 `git diff` 또는 파일 내용에서 **실제로 재현 가능한지** 확인
  - 재현 불가 → false positive로 판정 후 제거
  - 재현 확인 → 최종 위반 목록에 포함

#### 3.2 Security 차원 평가

- **체크리스트 SOT**: `.claude/skills/security/SKILL.md` — OWASP A01~A10 + 프로젝트 특화 체크. diff 파일 유형에 해당하는 영역 절만 선택 적용 (전체 로드 X). 보안 체크 기준은 여기에만 정의 — 본 스킬 checklists에 중복 정의 금지
- **severity 매핑**: /security 기준 Critical → `[B·Sec]` -20, Warning → `[M·Sec]` -10, 권장 수준 → `[m·Sec]` -3
- **재현/검증**: 보안 이슈는 특히 false positive 위험이 크므로 재현 필수. 실제 취약 경로 존재 여부 확인.

#### 3.3 Maintainability 차원 평가

- **담당 체크리스트**: 구조, 네이밍, 정리, 재사용, JSDoc 문서화
- **Progressive Disclosure**: `common.md` [공통], 해당 파일 유형별 체크리스트
- **감점 태그**: `[B·Mai]` -20, `[M·Mai]` -10, `[m·Mai]` -3, `[n·Mai]` -1
- **재현/검증**: 컨벤션 위반은 파일에서 직접 확인
- **Karpathy Surgical Changes 위반 체크**: 변경 범위가 요청·plan에 명시되지 않은 인접 코드까지 확장된 경우(`-` 라인이 요청 범위 밖) `[M·Mai]` 감점. 정당한 이유가 있으면 plan "결정 사항"에 기록되어야 함. 상세: `.claude/rules/karpathy-principles.md`

#### 3.4 Consistency 차원 평가

- **담당 체크리스트**: 파일 유형별 패턴 준수 (페이지 수직 슬라이스, Memo/Handler, Query hook 등)
- **Progressive Disclosure**: `page-data.md` [페이지/페이지Hook], `common.md` [React]
- **감점 태그**: `[B·Con]` -20, `[M·Con]` -10, `[m·Con]` -3, `[n·Con]` -1
- **재현/검증**: 기존 프로젝트 패턴과 비교하여 실제 일관성 위반 확인

#### 3.5 Performance 차원 평가

- **담당 체크리스트**: deps 최소화, 참조 안정성, Memo/Handler 객체 패턴, 서버 값 중복 재계산
- **Progressive Disclosure**: `common.md` [React 공통], `page-data.md` [페이지Hook]
- **감점 태그**: `[B·Per]` -20, `[M·Per]` -10, `[m·Per]` -3, `[n·Per]` -1
- **재현/검증**: 성능 이슈는 실제 코드 경로에서 재현 (예: deps 3개는 실제로 존재 확인)

#### 3.6 종합 점수 산출

각 차원의 **검증된 위반만** 감점 누적:

```
차원별 점수 = 100 - sum(해당 차원의 검증된 위반 × severity 감점), 최소 0

종합 = (Cor × 0.25) + (Sec × 0.30) + (Mai × 0.20) + (Con × 0.15) + (Per × 0.10)
```

Quality Gate 판정: Blocking=0 + Security≥80 + 종합≥70 → PASS

### 4. 결과 보고

```
## /review 결과

### 점수
| 차원 | 점수 | 등급 |
|------|------|------|
| Correctness | 90 | A |
| Security | 100 | A |
| Maintainability | 75 | B |
| Consistency | 85 | B |
| Performance | 80 | B |
| **종합** | **87** | **B** |

### Quality Gate: PASS / FAIL
- Blocking: 0건
- Security: 100 >= 80
- 종합: 87 >= 70

### 위반 사항 (N건, 재현 검증 후)

**`파일경로`** (유형: 페이지)

#### Correctness
1. [m·Cor] `value[0]` → 시맨틱 변수명 (line 42) → Correctness -3

#### Security
1. [B·Sec] 검색어 입력 검증 누락 (line 12) → Security -20

#### Performance
1. [M·Per] useEffect deps 3개 → 최대 2개로 (line 78) → Performance -10

### False Positive 제거 ({M}건)
- [{severity}·{dim}] {파일}:{줄} — 재현 불가로 제거

### 통과 (K건)
- `파일경로`: 위반 없음
```

### 5. 확인 후 수정

사용자가 수정을 승인하면 위반 사항을 수정. 연쇄 정리 포함 (미사용 import 등 함께 제거), 기존 UX 동작 보존.

### 6. 타입 체크 + 린트

수정 완료 후 실행:

```bash
pnpm typecheck
pnpm lint
```

에러가 있으면 수정 후 재실행 (최대 3회).

### 7. 컨벤션/스킬 개선 제안 (해당 시)

아래 상황 발견 시 사용자에게 제안 (즉시 수정 X):

- 기존 체크리스트에 없는 **반복 패턴** (2회 이상 같은 이슈)
- 기존 컨벤션과 **충돌하는 더 나은 새 패턴**
- plan 문서의 "컨벤션 변경 필요" 항목 또는 짝 backlog의 `💡 컨벤션 개선 후보`
- 여러 리뷰에서 **같은 피드백이 반복**

제안 형식:

```
### 컨벤션/스킬 개선 제안 (N건)

1. **[대상: CLAUDE.md / .claude/rules/*.md / review 스킬]**
   - 현재: [현재 상태 또는 "규칙 없음"]
   - 제안: [새 규칙/수정안]
   - 근거: [왜 필요한지]

→ 반영할까요? (승인 시 해당 파일 업데이트)
```

승인 시 해당 파일(CLAUDE.md, 규칙, 스킬, memory 등) 업데이트. planning 문서의 "컨벤션 변경 필요" 항목도 해소 처리.

---

## /review-ui

- UI 시각/렌더 리뷰가 필요하면 `/review-ui`를 별도 실행 (Playwright CLI 스크린샷 캡처, 콘솔 에러, 레이아웃).

## 주의사항

- 위반 사항은 **보고 먼저** → 사용자 확인 후 수정 (즉시 수정하지 않음)
- 수정 시 기존 UX 동작 보존
- 파일 유형에 해당하는 체크리스트만 적용 (전부 체크하지 않음)
- 타입 체크/린트 에러 발생 시 수정 후 재실행 (최대 3회)
- 컨벤션/스킬 제안은 **사용자 승인 후에만** 반영
- **변경되지 않은 파일의 기존 이슈는 점수에 포함하지 않음** — 리뷰 대상은 git diff에 포함된 변경분만
