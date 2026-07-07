# 공통 + React 체크리스트

`/review` 스킬의 상세 참조. 모든 파일에 적용되는 공통 규칙과 React 컴포넌트/Hook에 공통 적용되는 규칙.

> 각 항목의 `[severity·dimension]` 태그로 감점과 차원이 결정된다.
> `B` = Blocking(-20), `M` = Major(-10), `m` = Minor(-3), `n` = Nit(-1)
> `Cor` = Correctness, `Sec` = Security, `Mai` = Maintainability, `Con` = Consistency, `Per` = Performance

---

## [공통] — 모든 파일에 적용

### 구조

- [ ] [m·Mai] 삼항식 중첩 없음 (최대 1회)
- [ ] [m·Mai] if 분기 최소화 — 분기 많으면 memo/handler/별도 함수로 분리
- [ ] [M·Con] 파일 내 중첩 컴포넌트 → 별도 파일로 분리
- [ ] [M·Mai] 불필요한 추상화/래퍼 없음 (3곳 미만이면 인라인)

### 네이밍

- [ ] [m·Mai] 시맨틱 변수명 (`value[0]` → `startValue`)
- [ ] [m·Mai] Boolean: `is{State}`, `has{Quality}`, `enable{Feature}`
- [ ] [n·Mai] 구조분해 기본값 직접 할당 (`const { val = default } = props`)
- [ ] [m·Con] 상수: UPPER_SNAKE_CASE, 함수/변수: camelCase, 컴포넌트: PascalCase
- [ ] [m·Con] 파일명: 컴포넌트 PascalCase, 훅/유틸 camelCase, 디렉토리 lowercase
- [ ] [m·Con] camelCase 일관성 — snake_case 혼입 금지 (API 응답 필드명도 변환)
- [ ] [m·Mai] 매직 넘버 상수화

### 정리

- [ ] [m·Mai] 미사용 import, 변수, 타입 제거
- [ ] [M·Mai] 제거된 prop/기능의 연쇄 코드 정리 (useMemo, 헬퍼, 타입, 상수)
- [ ] [m·Mai] console.log/debugger 잔류 없음 (데모 페이지 제외)

### 재사용

- [ ] [M·Mai] `src/lib/`에 동일 유틸 함수 존재 시 재구현 금지
- [ ] [M·Mai] `src/hooks/`에 동일 훅 존재 시 재구현 금지
- [ ] [M·Mai] `src/components/`에 동일 컴포넌트 존재 시 직접 구현 금지

### 브라우저 호환성

- [ ] [M·Cor] 실험적 CSS property 사용 금지 (Can I Use 98%+ 기준)
- [ ] [n·Con] vendor prefix 필요한 속성은 Tailwind/Autoprefixer에 위임 (수동 prefix 금지)

---

## [React] — React 컴포넌트/Hook 파일에 적용

### Hook 규칙

- [ ] [M·Per] useEffect/useMemo/useCallback deps 최대 2개 (가능하면 1개)
- [ ] [M·Per] useEffect 최소화 — 이벤트 핸들러, useMemo, handler 패턴으로 대체 가능한지
- [ ] [M·Per] 참조 안정성 — Hook 반환값에 매 렌더 새 객체/배열 없음 (useMemo/useCallback)

### 패턴

- [ ] [M·Con] Memo 객체 패턴 — `xxxMemo = { key: useMemo() }` (useMemo로 객체 자체 감싸기 금지, 단독 useMemo 금지)
- [ ] [M·Con] Handler 객체 패턴 — `xxxHandler = { fn: useCallback() }` (단독 useCallback 금지)
- [ ] [m·Con] Handler/Memo 한 hook 내에서 객체/개별 혼재 금지
- [ ] [n·Con] Context 구조분해 직접 할당 (`const { xxx } = useContext()`)
- [ ] [M·Mai] 불필요한 래퍼 훅 없음 — context에서 직접 가져오기
- [ ] [M·Con] `register` 미사용 → `Controller` 통일 (form 관련 파일)
- [ ] [B·Cor] 브라우저 API 환경 가드 — `typeof window === "undefined"` 가드 (localStorage 등 브라우저 API를 모듈 최상위에서 접근 시, Vitest `node` 환경의 unit 테스트에서 no-throw 보장)

---

## [테스트] — `__tests__/**`, `*.test.ts`, `*.spec.ts` 파일에 적용

### 수직 슬라이스 원칙

- [ ] [M·Cor] public interface만 테스트 — 내부 구현(private 함수, 내부 상태) 직접 접근 금지
- [ ] [M·Cor] 수직 슬라이스 — RED→GREEN 한 사이클씩 (수평 슬라이싱: 테스트 전체 → 구현 전체 금지)
- [ ] [M·Cor] 테스트가 내부 리팩토링에서 살아남는가 — 내부 함수명 변경 시 테스트가 깨지면 구현 결합 의심
- [ ] [m·Mai] 테스트 설명이 행동 기술 — "X를 호출한다" 아닌 "사용자가 Y할 때 Z가 된다"
- [ ] [M·Cor] 네트워크 요청은 MSW로 목킹 — 외부 의존성 없는 순수 함수만 순수 단위 테스트
