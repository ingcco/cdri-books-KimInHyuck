---
description: "디버깅 4 단계 방법론 SOT. 진단 → 재현 → 수정 → 재발방지. 사용자가 '버그/안 됨/이상하다/에러 났어/디버깅 도와줘' 신고 시 본 문서를 로드해 절차론을 따라가게 강제. 자동 로드 X(매 파일 편집 시 토큰 부담 회피) — 트리거 키워드 기반 또는 디버깅 세션 시작 시 참조."
---

# 디버깅 방법론 (4 단계)

> 출처: 토스 frontend-fundamentals `https://frontend-fundamentals.com/debug/`. 본 문서는 그 절차론을 이 프로젝트 컨텍스트(Next.js App Router, React Query, 카카오 도서 검색 API)에 맞게 재정리한 SOT.

## 핵심 원칙

- **추측 금지, 절차 따르기** — 버그는 한 번에 풀리지 않는다. 진단 없이 수정하면 같은 곳에서 재발.
- **단계 건너뛰기 금지** — 진단 → 재현 → 수정 → 재발방지. 재현 안 된 버그는 수정해도 검증 불가.
- **memory에 기록** — 재발 가능성 있으면 `.claude/projects/.../memory/` 또는 `anti-patterns.md`로 승격.

## 1. 진단 — 무엇이 문제인지 정확히

### 1.1 에러 메시지 단어 단위 해석

전체 메시지 검색창 복붙 ❌ → 메시지 **단어 단위로** 분석 ✅.

```
TypeError: Cannot read properties of undefined (reading 'name')
                                    ^^^^^^^^^                ^^^^
                                    무엇이 undefined?         어떤 속성?
```

- 에러 타입 (`TypeError`/`SyntaxError`/`ReferenceError` 등)
- 키워드 (`undefined`/`is not a function`/`unexpected end of JSON`)
- 발생 위치 (스택 trace 첫 줄 — 우리 코드 vs 라이브러리)
- 타입/await 누락/네트워크/모듈 시스템 의심 순으로 검증

### 1.2 작업 지도 (Task Map) 그리기

증상만 따라가지 말고 **작업 흐름을 시각화**. 각 단계의 expected vs actual을 명시.

```
[검색어 입력] → [form.handleSubmit] → [validation] → [useQuery] → [/api/books 프록시] → [카카오 응답] → [리스트 렌더]
                                          ^^^^^^^^^^                                        ^^^^^^^^^^
                                          여기서 silent fail?                               응답 shape 불일치?
```

비동기/상태 전이/입력 검증에 특히 유용. 예: zod transform 실패 시 onSubmit 자체가 안 불려 silent fail. `handleSubmit(onSubmit, onError)` 양쪽 로그가 task map 단계 검증.

### 1.3 "되야 할 것 같은데 안 됨" (should-work-but-doesn't) → 공식 문서 + GitHub 이슈 트래커 교차

외부 라이브러리/프레임워크가 **공식 문서대로 했는데 동작하지 않을 때**(특히 로컬은 되는데 빌드/배포에서만 깨질 때)는 **우리 미스컨피그로 단정 말고** 공식 문서와 **해당 라이브러리의 GitHub 이슈 트래커를 함께** 본다. 문서는 "어떻게 써야 하는가"를, 이슈 트래커는 "현재 무엇이 깨져 있는가"를 답한다 — 갭의 정답이 이슈에만 있는 경우가 많다.

**발동 조건**: (1) 공식 문서 패턴을 그대로 따랐다 + (2) 그런데 안 된다 + (3) 우리 코드는 clean한데 특정 환경(로컬/빌드/배포)에서만 깨진다.

**절차**:
1. 공식 문서로 **현재 우리 구조가 권장 패턴과 정합한지** 먼저 확정(정합하면 우리 버그 가능성↓)
2. 라이브러리 GitHub 이슈/디스커션을 **증상 키워드 + 환경 키워드**로 검색
3. 일치 이슈에서 **추출**: ① open/closed ② affected version(우리 버전 포함 여부) ③ workaround ④ fixed version(있으면)
4. 판정: **open + 우리 버전 영향 + workaround 존재** → 업스트림 버그 확정(우리 버그 아님). workaround 적용 + **재평가 트리거**(이슈 close / fixed version 도달 시 원래 방식 재검토)를 문서/메모리에 기록

**왜 이슈 트래커인가**: 문서는 "정상 동작"을 전제로 쓰여 알려진 회귀/버그를 담지 않는다. "should-work-but-doesn't"의 근본 원인은 대개 **문서엔 없고 이슈엔 있다**.

**예시**: 로컬 dev는 정상인데 배포 환경(서버리스)에서만 500이 나는 경우, 공식 문서만 봤으면 우리 미스컨피그로 오진했을 것 — 실제 원인은 프레임워크 GitHub 이슈(open, 특정 번들러/런타임 회귀, workaround 존재)에 있는 사례가 많다. "현재 한정 + 재평가 트리거" 프레이밍으로 plan doc에 박제한다.

> 출처 권위 도메인·추출 항목 SOT: `.claude/rules/external-docs.md` "동작이 문서와 다를 때 — GitHub 이슈 트래커".

---

## 2. 재현 — 일관되게 버그 트리거

> **재현 안 된 버그는 수정 금지**. "고친 것 같음" 위험.

### 2.1 단순화 — 최소 재현 코드

핵심 로직만 남기고 무관 코드 제거. 데이터 fetch + 필터 + UI + 이벤트가 섞인 컴포넌트면 → 함수 1개 + 입력 array로 격리.

### 2.2 debugger / console 활용

- `debugger;` 한 줄 삽입 → DevTools에서 변수 추적
- `console.table()` `console.group()` `console.time()` 활용
- 조건부: `if (특정조건) console.log(...)` — 불필요 로그 제외

### 2.3 경곗값 테스트

- 경계 ±1 (10자 입력 → 0/10/11자)
- 예상 범위 밖 (검색 결과 0건, 페이지 마지막)
- 극단값 (`Number.MAX_SAFE_INTEGER`, 빈 문자열 검색)

"이 값은 안 올 것" 가정의 순간 버그가 들어옴.

### 2.4 반복 재현 — 자동화

간헐 발생 버그는 수동 반복 비효율. `simulateRapidClicks()` 같은 자동화 함수로 빠른 연속 입력.

### 2.5 추적 — 결과만 X, 과정 기록

이전 상태 + UI 상호작용 순서가 재현 조건일 수 있음. 화면 이동, 탭 전환, 모달 토글 등 시간 순서로 기록.

---

## 3. 수정 — 근본 원인

### 3.1 표면 vs 근본

❌ **표면 마스킹** (anti-patterns#EH-3):
- `as` type assertion으로 undefined 우회
- `try/catch` 빈 catch로 swallow
- 빈 default `?? []`로 nullable 가림

✅ **근본 원인**:
- undefined → 데이터 존재 검증 + optional chaining 명시
- race condition → debounce 대신 `AbortController` (in-flight 취소)
- type assertion → React Query `select`로 변환 (RX-7)

### 3.2 순수 함수로 분리

비즈니스 로직을 UI/IO에서 떼어내 입출력만 있는 함수로. 테스트 가능 + 재사용 + 변경 영향 국소화.

예: `app/api/books/route.ts`의 쿼리 파라미터 검증·응답 변환을 순수 함수로 분리. React 컴포넌트에선 계산 로직을 util로 분리.

### 3.3 Dead Code 제거

미사용 함수/스타일/실험 분기 → 정리. 디버깅 시 추적 비용 ↑.

도구: `ts-prune`, `knip`. A/B 테스트 끝난 분기는 승자만 남기고 제거.

---

## 4. 재발방지 — 같은 버그 다시 안 나오게

### 4.1 에러 로그

- **자동 캡처**: 환경(브라우저/디바이스/timezone), 배포(version/commit/build time), 런타임 상태
- **Breadcrumbs**: 사용자 액션 시퀀스 — race condition 추적
- **Tags**: version/region/feature flag 필터링

**개인정보 금지**: full IP, 결제 정보, 식별자는 mask. 익명 ID만.

### 4.2 버그 리포트 템플릿

| 필드 | 내용 |
|---|---|
| 재현 환경 | iOS 17.4.1 (iPhone 13 Pro), Safari 등 구체 |
| 사용자 흐름 | 단계별 (1. 검색어 입력 → 2. 결과 클릭 → ...) |
| 기술적 근본 원인 | 컴포넌트/훅/API 응답/상태 관리 레벨 + PR diff 링크 |
| 재발방지 조치 | type 정의 / lint rule / 커스텀 hook / 리팩토링 |
| 시각 자료 | 스크린샷·비디오 |

이 프로젝트에선 plan doc(`.docs/plans/*.md`)의 "발견 사항" 절이 이 역할.

### 4.3 유틸/lint로 박제

같은 실수가 두 번 → **개인 학습 X, 시스템 박제**.

- 공통 컴포넌트 API 수정 (예: `isDisabled` 헷갈림 → `disabled` 표준화)
- ESLint 룰 추가 (오탈자 자동 워닝, dummy text `'홍길동'` 차단 `no-restricted-syntax`)
- anti-patterns.md에 카탈로그화 (구조적 패턴이면)
- memory `feedback_*`에 저장 (1회성이면)

---

## 프로젝트 적용 가이드

### Next.js + React Query 컨텍스트

- **타입 오류 위장 금지** (RX-7): `useQuery<T, E, FinalShape>` 3번째 generic 자의 변경 ❌ → `select: ({ data }) => ...`
- **Form silent fail** (RX-8): `handleSubmit(onSubmit, onError)` 양쪽 핸들러 — zod transform 실패도 onError로 잡힘
- **state closure** (RX-9): 비동기 race에서 stale state — 제어 변수는 `useRef` (UI 노출 값은 useState)
- **고빈도 이벤트 성능** (RX-10): 드래그/스크롤 60Hz는 setState 금지 → useRef + DOM 직접 조작
- **cleanup** (RX-11): useEffect의 setInterval/setTimeout/EventListener → return cleanup 의무. fetch는 `AbortController`로 취소

### 카카오 프록시 Route Handler 컨텍스트

- **키 노출** → `KAKAO_REST_API_KEY`는 서버 전용. 클라이언트 번들·응답·에러 메시지로 새는지 확인
- **응답 shape 불일치** → 카카오 응답(`documents`, `meta`)과 프론트 interface 필드/optional 교차 확인
- **에러 전파** → 카카오 4xx/5xx·타임아웃을 프론트가 처리 가능한 코드로 매핑했는지. 미검증 passthrough 금지
- **dev 첫 진입 지연 오인** → 첫 컴파일 지연(수 초)은 서버 로직 문제가 아님. 두 번째 요청 latency로 실제 성능 측정

---

## 관련 자산

- 안티패턴 카탈로그: `.claude/rules/anti-patterns.md` (EH-1~3, RX-7~11)
- 메모리: `feedback_*` (재발 1회성 학습)
- 변경 이력: plan doc(`.docs/plans/*.md`)의 "발견 사항" 절
- Karpathy 원칙: `.claude/rules/karpathy-principles.md` (특히 "Goal-Driven Execution" = 재현 가능 검증)
- AI 방어: `.claude/rules/ai-defense.md` "Silent Failure 방지" / "반복 실수 방지"
