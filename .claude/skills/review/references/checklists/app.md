# 앱 레이어 체크리스트 (페이지/페이지Hook/API)

`/review` 스킬의 상세 참조. `app/**`, `lib/**`에 적용되는 규칙.

> `B` = Blocking(-20), `M` = Major(-10), `m` = Minor(-3), `n` = Nit(-1)
> `Cor` = Correctness, `Sec` = Security, `Mai` = Maintainability, `Con` = Consistency, `Per` = Performance

---

## [페이지] — `page.tsx`, `page.style.ts`

- [ ] [M·Con] 3파일 분리: `hooks/useXxx.ts` + `page.style.ts` + `page.tsx`
- [ ] [m·Con] `page.style.ts`: export명 `pageVariants`, slots는 구조적 레이아웃만 (tailwind-variants)
- [ ] [n·Con] `page.tsx`: 세부 디자인은 인라인, `const styles = pageVariants()` 컴포넌트 외부 호출
- [ ] [m·Con] Provider 조합: `<XxxProvider value={xxx}>` 패턴
- [ ] [m·Con] 디자인 값은 `@theme` 토큰 사용 — 하드코딩 색상/간격 금지

---

## [페이지Hook] — `app/**/hooks/use*.ts`, `hooks/**`

- [ ] [m·Con] 내부 순서: State → Query/Mutation → Memo → Handler
- [ ] [M·Con] Context 패턴: `type ContextValue = ReturnType<typeof useHook>` + Provider + useContext + throw
- [ ] [m·Con] Query hook 구조분해 금지 (`const xxxQuery = useXxxQuery()`)
- [ ] [m·Con] URL 상태(검색어·페이지)는 nuqs로 관리 — 로컬 useState 중복 금지
- [ ] [M·Per] Mutation: callback ref로 mutate 안정화
- [ ] [m·Con] Handler: `.mutate(variables)`만 호출 (mutateAsync 금지)
- [ ] [M·Cor] Mutation onSuccess 합성: 내부 로직 후 `options?.onSuccess?.(...args)`

---

## [API Route] — `app/api/**/route.ts`

> 카카오 도서 API 프록시 등 서버 측 라우트에 적용. REST 키를 클라이언트에 노출하지 않기 위해 라우트 경유 시.

### 패턴

- [ ] [m·Con] `export const GET/POST` (named export)
- [ ] [M·Con] 3단계: Zod 검증(쿼리/바디) → 외부 API 호출 → 응답
- [ ] [m·Con] 조회 응답: `{ success: true, data }`, 에러: `{ success: false, code, message }`
- [ ] [m·Con] Zod v4: `z.treeifyError(result.error)` 로 검증 에러 정리

### 에러 처리

- [ ] [M·Cor] 외부 API 실패(4xx/5xx)를 try/catch로 잡아 사용자 친화적 응답으로 변환
- [ ] [M·Cor] 타임아웃/네트워크 에러 방어적 처리

> **보안 항목**(REST 키 서버 보관, 입력 검증, 응답에 민감정보 제외 등)은 본 파일에 정의하지 않는다 — Security 차원 패스가 보안 SOT `.claude/skills/security/SKILL.md` 체크리스트를 직접 적용 (/review SKILL.md 3.2 참조).

---

## [API 모듈] — `lib/api/**`, `lib/**`

### 네이밍

- [ ] [m·Con] 요청 함수: `{동사}{Domain}` (예: `searchBooks`, `getBookDetail`)
- [ ] [m·Con] 쿼리 훅: `use{Domain}Query` / `use{Domain}Mutation`
- [ ] [m·Con] 응답 타입: 카카오 도서 API 응답 shape과 1:1 (`meta`, `documents`)

### 구조

- [ ] [M·Con] axios 인스턴스 1개로 공통 설정(baseURL, 헤더) 집약 — 중복 생성 금지
- [ ] [m·Con] query.ts: `UseQueryOptions`/`UseMutationOptions`로 확장 가능하게
- [ ] [M·Cor] 서버 응답 필드를 camelCase로 정규화 (컴포넌트에서 snake_case 직접 참조 금지)
- [ ] [m·Con] queryKey 설계: 검색어·정렬·페이지 등 파라미터를 배열에 포함
