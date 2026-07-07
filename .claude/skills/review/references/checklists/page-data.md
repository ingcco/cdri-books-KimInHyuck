# 페이지/데이터 레이어 체크리스트 (페이지/페이지Hook/API 모듈)

`/review` 스킬의 상세 참조. `src/pages/**`, `src/lib/**`에 적용되는 규칙.

> `B` = Blocking(-20), `M` = Major(-10), `m` = Minor(-3), `n` = Nit(-1)
> `Cor` = Correctness, `Sec` = Security, `Mai` = Maintainability, `Con` = Consistency, `Per` = Performance

---

## [페이지] — `{Name}Page.tsx`, `styles/page.style.ts`

- [ ] [M·Con] 수직 슬라이스 분리: `{Name}Page.tsx`(조립) + `hooks/use{Name}.ts`(상태) + `components/`(Context 소비) + `styles/page.style.ts`(구조 레이아웃)
- [ ] [m·Con] `page.style.ts`: export명 `pageVariants`, slots는 구조적 레이아웃만 (tailwind-variants)
- [ ] [n·Con] `{Name}Page.tsx`: 세부 디자인은 인라인, `const styles = pageVariants()` 컴포넌트 외부 호출
- [ ] [m·Con] Provider 조합: `<XxxProvider value={xxx}>` 패턴
- [ ] [m·Con] 디자인 값은 `@theme` 토큰 사용 — 하드코딩 색상/간격 금지

---

## [페이지Hook] — `src/pages/**/hooks/use*.ts`

- [ ] [m·Con] 내부 순서: State → Query/Mutation → Memo → Handler
- [ ] [M·Con] Context 패턴: `type ContextValue = ReturnType<typeof useHook>` + Provider + useContext + throw
- [ ] [m·Con] Query hook 구조분해 금지 (`const xxxQuery = useXxxQuery()`)
- [ ] [m·Con] URL 상태(검색어·상세검색 조건)는 nuqs로 관리 — 로컬 useState 중복 금지
- [ ] [M·Per] Mutation: callback ref로 mutate 안정화
- [ ] [m·Con] Handler: `.mutate(variables)`만 호출 (mutateAsync 금지)
- [ ] [M·Cor] Mutation onSuccess 합성: 내부 로직 후 `options?.onSuccess?.(...args)`

---

## [API 모듈] — `src/lib/api/**`

> 카카오 API를 클라이언트에서 직접 호출한다(BFF/프록시 없음). 키 노출·에러 정규화 등 **보안 항목**은 본 파일에 정의하지 않는다 — Security 차원 패스가 보안 SOT `.claude/skills/security/SKILL.md` 체크리스트를 직접 적용(/review SKILL.md 3.2 참조).

### 네이밍

- [ ] [m·Con] 요청 함수: `get{Domain}List`/`get{Domain}`(단건) 등 web-andrsen 컨벤션 정렬 (예: `getBookList`)
- [ ] [m·Con] 쿼리 훅: `use{Domain}ListQuery` / `use{Domain}ListInfiniteQuery`
- [ ] [m·Con] 응답 타입: 카카오 도서 API 응답 shape과 1:1 (`meta`, `documents`)

### 구조

- [ ] [M·Con] axios 인스턴스 1개(`src/lib/api/index.ts`)로 공통 설정(baseURL, `Authorization: KakaoAK` 헤더) 집약 — 중복 생성 금지
- [ ] [m·Con] query.ts: `UseQueryOptions`/`UseInfiniteQueryOptions`로 확장 가능하게
- [ ] [M·Cor] `src/lib/api/{domain}/api.ts`는 카카오 응답을 **그대로 반환** — snake_case(`sale_price` 등)를 임의로 camelCase 변환하지 않음(동일 shape 수동 재구성 금지, `conventions.md` "응답 변환 정책" 패턴 A). 파생 값이 필요하면 React Query `select`에서 계산
- [ ] [m·Con] queryKey 설계: 검색어·target·페이지 등 파라미터를 배열에 포함(`src/lib/api/shared/queryKeys.ts` 팩토리)
