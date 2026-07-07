# 구현 체크리스트

단독 Next.js 앱(App Router)에서 자주 반복되는 구현 단위별 체크리스트. plan의 Step을 세분화할 때 참조.

## 새 페이지 추가 시

### 1. 라우트 파일 (3파일 분리)

- [ ] `app/{route}/page.tsx` 생성 (마크업 + 조립)
- [ ] `app/{route}/page.style.ts` 생성 (`pageVariants` — tailwind-variants, 구조적 레이아웃 slots만)
- [ ] `app/{route}/hooks/use{Route}.ts` 생성 (상태 + React Query + 핸들러)

### 2. 데이터 연결

- [ ] React Query 훅 작성 (`use{Domain}Query` / `use{Domain}Mutation`)
- [ ] URL 상태는 nuqs로 관리 (검색어, 페이지 등)
- [ ] 폼이 있으면 RHF + zod (Controller 통일)

### 3. 검증

```bash
pnpm typecheck
pnpm lint
```

- [ ] 브라우저에서 렌더 확인 (`http://localhost:3000/{route}`)

---

## 새 컴포넌트 추가 시

### 1. 컴포넌트 파일

- [ ] `components/{Component}.tsx` 생성 (재사용 UI는 `components/`, 페이지 전용은 해당 route 하위)
- [ ] "use client" 지시문 (상태/이벤트 있을 때만)
- [ ] tailwind-variants로 스타일 정의 (`@theme` 토큰 사용, 하드코딩 값 금지)
- [ ] Props 타입 정의 및 export

### 2. 재사용 확인

- [ ] `components/`에 동일 기능 컴포넌트가 이미 있는지 확인 (중복 구현 금지)

### 3. 검증

```bash
pnpm typecheck
pnpm lint
```

---

## 새 React Query 훅 추가 시

### 1. API 함수

- [ ] `lib/api/` 아래 axios 요청 함수 작성 (`{동사}{Domain}` 네이밍)
- [ ] 응답 타입 정의 (카카오 도서 API 응답 shape에 맞게)

### 2. 쿼리 훅

- [ ] `use{Domain}Query` / `use{Domain}Mutation` 작성
- [ ] queryKey 설계 (검색어·페이지 등 파라미터 포함)
- [ ] 구조분해 금지 — `const xxxQuery = useXxxQuery()`

### 3. 테스트

- [ ] MSW로 카카오 API 응답 목킹 → 훅 통합 테스트 (Vitest)

### 4. 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
```

---

## 새 유틸리티 함수 추가 시

### 1. 함수 파일

- [ ] `lib/` 아래 적절한 파일에 추가 또는 새 파일 생성
- [ ] JSDoc 주석 (동작이 자명하지 않을 때만)
- [ ] 타입 정의 + 함수 export

### 2. 테스트

- [ ] 단위 테스트 작성 (순수 함수 — Vitest)
- [ ] 엣지 케이스 테스트

### 3. 검증

```bash
pnpm typecheck
pnpm lint
pnpm test
```

---

## 공통 검증 명령어

```bash
pnpm typecheck   # 타입 체크
pnpm lint        # 린트
pnpm test        # 테스트
pnpm build       # 빌드 확인
```

> 스크립트명은 프로젝트 `package.json`을 기준으로 확인 후 사용.

---

## 트러블슈팅

### 의존성 문제

```bash
# 캐시 삭제 후 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 타입 에러

- `tsconfig.json`의 `paths` 별칭 확인
- `pnpm install` 후 IDE 재시작
