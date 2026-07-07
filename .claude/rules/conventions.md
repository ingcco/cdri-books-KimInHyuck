---
description: "코딩 컨벤션 — TypeScript ES Modules, 파일명 규약(PascalCase/camelCase), Export 패턴, 페이지 수직 슬라이스, 주석 한글."
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# 코딩 컨벤션 상세

> 본 룰은 **코드 스타일**(문법)을 다룬다. **행동 메타 원칙**(태도)은 `.claude/rules/karpathy-principles.md` — Think Before Coding / Simplicity First / Surgical Changes / Goal-Driven Execution 참조. 작업 시작 시 Karpathy를 메타 적용한 후 본 룰의 구체 임계값을 적용한다.

## 스택 요약

Vite + React 19 CSR + react-router v7 + TypeScript(strict) · Tailwind v4(`@theme` 토큰) + tailwind-variants(`tv`) · React Query v5 · nuqs(react-router 어댑터) · react-hook-form + zod · axios(`dapi.kakao.com` 직접 호출) · 자체 UI 컴포넌트 · Vitest + MSW · Playwright · pnpm(포트 3000).

## 타입 컨벤션

```typescript
// interface — Props 등 확장 가능한 객체
export interface ButtonProps extends Omit<ComponentProps<"button">, "disabled"> {
  ref?: Ref<HTMLButtonElement>;
}

// type — 유니온, 함수 반환, 파생 타입
export type SearchTarget = "title" | "isbn" | "publisher" | "person";
export type ButtonVariants = typeof buttonVariants;

// 타입 정의 위치 — 사용하는 파일에 정의 (별도 types.ts 금지)
// Props 확장 — Pick/Omit/intersection으로 소스 인터페이스에서 조합 (수동 재정의 금지)
```

## 페이지 수직 슬라이스 (프로젝트 공식 규약)

라우트 하나를 **수직 슬라이스**로 구성한다. 상세 파일별 역할·예시 트리는 `.claude/rules/page.md` SOT.

```
src/pages/{Name}Page/
├── {Name}Page.tsx        ← 얇은 조립: Context.Provider + 컴포넌트 배치 (비즈니스 로직 없음)
├── hooks/
│   └── use{Name}.ts      ← 페이지 상태 전부(query/filter/form/handler) + Context value 생성
├── components/           ← Context 소비만 (자체 데이터 훅 금지)
└── styles/
    └── {name}.style.ts   ← tv 슬롯 (pageVariants 등)
```

데이터 계층:

```
src/lib/api/client/http.ts          ← axios 인스턴스 (dapi.kakao.com baseURL + KakaoAK Authorization 헤더)
src/lib/api/{domain}/api.ts         ← 순수 요청 함수 (axios 호출만, 카카오 응답 그대로 반환)
src/lib/api/{domain}/api.queries.ts ← useQuery/useMutation wrapper hook
src/lib/api/shared/queryKeys.ts     ← 쿼리 키 팩토리
```

**규칙**:

- `components/`는 페이지 Context를 **소비만** 한다 — 자체 `useQuery`/`useXxxQuery` 호출 금지(데이터 훅은 `hooks/use{Name}.ts`에 한 곳)
- 데이터 fetch·필터·핸들러 상태는 전부 `hooks/use{Name}.ts`에 모으고, `{Name}Page.tsx`가 그 값을 Context로 주입

## 페이지 컴포넌트 선언 방식

```typescript
// ✅ 올바른 패턴 — const 선언식 + export default (화살표 함수)
const SearchPage = () => {
  return <div />;
};
export default SearchPage;

// ❌ function 선언식 금지
export default function SearchPage() { ... }
```

## `{Name}Page.tsx` 조건부 렌더링 — 단일 return

페이지 컴포넌트(`{Name}Page.tsx`)는 early return 금지. 로딩·에러·빈 상태를 포함한 모든 분기는 단일 `return ()` 안에서 JSX 조건부 렌더링으로 처리한다.

```tsx
// ✅ 단일 return — 모든 상태를 JSX 안에서 처리
const SearchPage = () => {
  const { booksQuery, data } = useSearchContext();

  return (
    <>
      {booksQuery.isPending && <SearchSkeleton />}
      {!booksQuery.isPending && data.documents.length === 0 && <EmptyResult />}
      {!booksQuery.isPending && data.documents.length > 0 && (
        <BookList books={data.documents} />
      )}
    </>
  );
};

// ❌ early return — 금지
const SearchPage = () => {
  if (isPending) return <SearchSkeleton />;     // 금지
  if (isEmpty) return <EmptyResult />;          // 금지
  return <BookList />;
};
```

## 상수 파일 위치 (`src/constants/` 또는 `src/lib/constants/`)

앱 내 라벨·옵션 상수는 한곳에 모아서 관리한다.

| 파일 | 내용 |
|------|------|
| `constants/labels.ts` | 코드값 → 한글 라벨 매핑 (예: `SORT_LABEL = { accuracy: "정확도순", latest: "최신순" }`) |
| `constants/dropdownList.ts` | Dropdown/필터 옵션 리스트 — `dropdownList.{domain}` 형태 (예: `dropdownList.searchTarget`) |

**규칙:**
- **Dropdown list·필터 옵션은 상수로** (`dropdownList.{domain}`). **page/컴포넌트에서 `useMemo`로 옵션 배열 생성 금지** — 정적 리스트는 모듈 상수가 참조 안정성 보장 (react.md "단독 useMemo 금지")
- 3곳 미만 사용 상수는 인라인 허용 — `labels.ts`는 라벨 매핑 전용

## 공유 요청 타입 (`src/lib/api/shared/request.type.ts`)

페이지네이션이 필요한 목록 요청 파라미터는 `Pageable`을 extend한다.

```typescript
// src/lib/api/shared/request.type.ts
export interface Pageable {
  page?: number;
  size?: number;
}

// src/lib/api/books/api.ts
export interface BookSearchParams extends Pageable {
  query: string;
  target?: SearchTarget;
  sort?: "accuracy" | "latest";
}
```

## `src/lib/api/{domain}/api.ts` 응답 변환 정책

`src/lib/api/{domain}/api.ts` 함수는 axios로 `dapi.kakao.com`을 직접 호출한 뒤 **응답을 그대로 반환**한다. 카카오 `{ documents, meta }` 봉투를 그대로 쓰며(별도 응답 봉투 없음), 동일 shape인데도 수동 재구성·키 이름 변환·필드 변환을 추가하지 않는다.

| 패턴 | 적용 |
| --- | --- |
| **A (기본)** — 카카오 응답이 클라이언트 타입과 1:1 정합 | `return res.data;` 직접 반환 (`{ documents, meta }` = `BookSearchData` 그대로) |
| **B (변환 필요)** — 서버/클라 shape이 실제로 다름 (파생 값 계산, 정렬, 평탄화 등) | 변환 사유를 JSDoc에 명시 + 일관성 유지. React Query `select`에서 변환하는 것이 우선 |

```typescript
// ✅ A — 동일 shape, 직접 반환
export interface BookSearchResponse {
  documents: Book[];
  meta: { total_count: number; pageable_count: number; is_end: boolean };
}

export async function searchBooks(params: BookSearchParams): Promise<BookSearchResponse> {
  const res = await http.get<BookSearchResponse>("/v3/search/book", { params });
  return res.data;
}

// ❌ 동일 shape인데 재포장 — 디버깅 어렵게 만듦
export async function searchBooks(...): Promise<{ items: Book[]; total: number }> {
  const res = await http.get(...);
  return { items: res.data.documents, total: res.data.meta.total_count };
}
```

**근거**: 임의 변환은 호출자 디버깅 시 API 응답 로그와 클라 로그가 달라 추적 비용이 증가한다. 변환은 의미 있을 때만, 가능하면 `select`에서.

## 필터/검색 폼 — URL 필터(nuqs) + debounce 패턴

목록 페이지의 **URL 동기화 필터**(검색어·정렬·페이지 등)는 nuqs `useQueryStates`로 관리한다 — URL이 source of truth라 새로고침·뒤로가기·링크 공유에 필터가 복원된다. **상세검색 등 검증이 필요한 폼은 react-hook-form**(아래 "Form 바인딩 — Controller" 절 in react.md). Provider는 앱 루트에 nuqs **react-router 어댑터**(`NuqsAdapter` from `nuqs/adapters/react-router/v7`) 1회로 감싼다.

```typescript
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

// URL 필터 — 타입 파서로 string/int 자동 변환 + 기본값(non-null)
const [filters, setFilters] = useQueryStates({
  query: parseAsString.withDefault(""),
  target: parseAsString.withDefault(""),      // 제목/저자/출판사
  sort: parseAsString.withDefault("accuracy"),
  page: parseAsInteger.withDefault(1),
});

// 검색 debounce — client fetch(React Query)는 nuqs value를 useDebounce로 감싼다.
const debouncedQuery = useDebounce(filters.query, 500);
const booksQuery = useBookSearchQuery({
  query: debouncedQuery,
  target: filters.target,
  sort: filters.sort,
  page: filters.page,
});

// 핸들러 — setter가 URL을 직접 갱신. 검색어 변경 시 page=1 리셋
const searchHandler = {
  setQuery: (query: string) => setFilters({ query, page: 1 }),
  setTarget: (target: string) => setFilters({ target, page: 1 }),
  setSort: (sort: string) => setFilters({ sort, page: 1 }),
  setPage: (page: number) => setFilters({ page }),
};
```

**빈 검색어는 fetch를 건너뛴다** — `useBookSearchQuery`에서 `enabled: query.trim().length > 0`으로 게이트(빈 검색어 API 호출 금지).

**`{Name}Page.tsx` — value/onChange 직접 바인딩** (URL 필터는 검증 없음 → Controller 불필요):

```tsx
<Input
  value={filters.query}
  placeholder="검색어를 입력하세요"
  onChange={(e) => searchHandler.setQuery(e.target.value)}
/>

// Dropdown은 제네릭 — list가 DropdownListItem<string>[]이면 onChange(string) 자동 추론
<Dropdown value={filters.sort} list={dropdownList.sort} onChange={searchHandler.setSort} />

// ❌ useState 각각 / router.replace + useEffect 수기 동기화 / Controller로 URL 필터 바인딩
```

## Query select — 파생 UI 상태 계산

API 응답에서 파생되는 UI 상태(빈 결과 여부, 다음 페이지 존재 등)는 `useQuery`의 `select`에서 계산한다. 페이지 컴포넌트에서 인라인 계산 금지.

```typescript
// ✅ select에서 파생 상태 추가
useQuery({
  select: (res) => ({
    ...res,
    hasNoResults: res.documents.length === 0,
    hasNextPage: !res.meta.is_end,
  }),
});

// {Name}Page.tsx — select 결과를 그대로 사용
{query.data?.hasNoResults && <EmptyResult />}

// ❌ 페이지 컴포넌트에서 파생 상태 계산
const hasNoResults = booksMemo.documents.length === 0;
```

## Hook 파일 네이밍

| 대상 | 패턴 | 예시 |
|---|---|---|
| 페이지 훅 파일명 | `useXxx.ts` (`useXxxHook.ts` 금지) | `useBookSearch.ts`, `useFavorites.ts` |
| export 방식 | `const` 선언식 + named export | `export { useBookSearch }` |

```typescript
// ✅ 올바른 패턴
const useBookSearch = () => {
  return { ... };
};
export { useBookSearch };

// ❌ 잘못된 패턴 — Hook suffix, function 선언식 모두 금지
export function useBookSearchHook() { ... }
```

## JSX Props 순서

원칙: **중요한 것(사용자 눈에 보이는 것) 위로, 거의 안 변하는 내부 속성 아래로, 이벤트는 항상 마지막.**

| 순서 | 분류 | 예시 | 이유 |
|---|---|---|---|
| 1 | 시맨틱/식별 | `label`, `type`, `required` | 이 필드가 무엇인지 — 가장 중요 |
| 2 | 상태 | `value`, `errorMessage`, `checked`, `disabled` | 자주 바뀌는 핵심 데이터 |
| 3 | 힌트 | `placeholder`, `autoComplete` | 정적 보조 속성, 거의 안 변함 |
| 4 | 바인딩 | `name`, `ref` | 프레임워크 내부 연결, 거의 안 변함 |
| 5 | 이벤트 (항상 마지막) | `onChange`, `onBlur`, `onClick` | — |

```tsx
// ✅ 올바른 순서 (중요한 것 → 정적 → 내부 → 이벤트)
<Input
  label="검색어"
  type="search"
  required
  value={field.value}
  errorMessage={fieldState.error?.message}
  placeholder="검색어를 입력하세요"
  name={field.name}
  ref={field.ref}
  onChange={field.onChange}
  onBlur={field.onBlur}
/>

// ❌ 바인딩(name, ref)이 맨 위 — 내부 속성이 중요 정보를 가림
```

**react-hook-form Controller 바인딩에서 `onBlur` 필수:**
- `onChange` — field value 동기화
- `onBlur` — `fieldState.isTouched` 마킹. validation mode가 `onBlur`/`onTouched`이면 재검증도 트리거

## 변수 네이밍

| 대상             | 패턴                        | 예시                                          |
| ---------------- | --------------------------- | --------------------------------------------- |
| Boolean          | `is{State}`, `has{Quality}` | `isFavorite`, `hasNextPage`                   |
| 상수 객체        | `UPPER_SNAKE_CASE`          | `SORT_LABEL`, `SEARCH_TARGETS`                |
| Ref              | `{name}Ref`                 | `inputRef`, `contentRef`                      |
| State            | `[xxx, setXxx]`             | `[isOpen, setIsOpen]`                         |
| Style 함수       | `{name}Variants`            | `bookCardVariants`, `buttonVariants`          |
| 페이지 Style     | `pageVariants`              | 모든 `page.style.ts`에서 동일 이름 사용       |
| Props 인터페이스 | `{Component}Props`          | `BookCardProps`, `ButtonProps`                |
| Context 타입     | `{Component}ContextValue`   | `SearchContextValue`                          |

## 코드 품질 원칙

> 출처: https://frontend-fundamentals.com/ (토스 frontend-fundamentals 4 기준).
> **각 기준의 실전 ❌→✅ 패턴은 `.claude/rules/anti-patterns.md` SOT 참조** — 가독성=CS/RX, 예측 가능성=PR, 응집도=CH, 결합도=CP·RX 카테고리.

### 가독성

- 동시에 실행되지 않는 코드는 분리 — 조건별 컴포넌트로 나누기
- 복잡한 조건식에 이름 부여 (`const isSameQuery = ...`)
- 매직 넘버 상수화 (`const SEARCH_DEBOUNCE_MS = 500`)
- 복잡한 삼항 → IIFE 또는 early return
- 구현 상세 숨기기 — 로딩/에러 처리는 컴포넌트·경계로 추상화
- 코드는 위에서 아래로 읽히게 — 시점 이동 최소화

### 예측 가능성

- 같은 종류의 함수는 같은 반환 타입 유지
- 함수 이름에 드러나지 않는 부수효과(로깅, API 호출) 금지
- 라이브러리와 같은 이름의 래퍼 사용 금지 — 의도를 담은 이름 사용

### 응집도

- 함께 수정되는 코드는 가까이 배치
- 공유 상수는 함께 사용하는 곳에서 관리
- 폼 검증: 필드별 복잡한 로직 → 필드 단위, 필드 간 의존성 → 폼 전체 단위

### 결합도

- 하나의 Hook이 너무 많은 쿼리/상태 관리 → 책임별 분리
- 중복 코드 공통화 판단: 항상 같이 수정되면 공통화, 페이지마다 달라질 여지 있으면 중복 허용
- Props Drilling → Composition 패턴(children) 우선, depth 깊으면 Context

### 트레이드오프

4가지 기준이 충돌할 때:

- 함께 수정되어야 하는가? → 응집도 우선
- 페이지마다 달라질 수 있는가? → 결합도 우선 (분리)
- 위험성 낮은가? → 가독성 우선 (인라인)

## 자체 컴포넌트·유틸 우선 사용 (3회 룰)

페이지·도메인 코드에서 새 헬퍼·컴포넌트·훅을 작성하기 전에 이미 `src/components/ui/`, `src/lib/utils/`, `src/hooks/`에 동일 기능이 있는지 먼저 확인한다.

### 빈도 기준 결정 트리

| 빈도                  | 처리                                                                  |
| --------------------- | --------------------------------------------------------------------- |
| **이미 있음**         | **자체 구현 금지** — 기존 함수/컴포넌트 import 의무                    |
| 1~2회 사용            | 호출처에 인라인 (최소 추상화 원칙 — 3곳 미만 인라인)                   |
| 3회 이상 사용         | `src/lib/utils/`·`src/components/ui/`·`src/hooks/`로 승격 후 호출처 일괄 교체      |

- 날짜 포맷·숫자 콤마·debounce 등 반복 유틸은 자체 재구현하지 말고 `src/lib/utils/`에 단일 SOT로 두고 재사용. 기본 포맷·옵션은 통일해 표기 일관성 확보
- 폼 컨트롤(button/input/select 등)은 raw HTML 대신 `components/ui/`의 자체 컴포넌트 사용 — 상세는 `page.md` "Raw HTML 지양"

### 자체 승격 절차 (3회 이상 누적 시)

1. 호출처 3곳 grep으로 검증 (`grep -rn '동일 패턴' src/`)
2. `src/lib/utils/`·`src/components/ui/`·`src/hooks/`로 승격
3. 호출처 일괄 교체 + 인라인 잔재 grep 검증

## JSDoc 컨벤션

```typescript
/**
 * 숫자를 천 단위 구분자와 함께 포맷
 * @param value 변환할 숫자
 * @param unit 단위 (예: "원", "권")
 * @returns 포맷된 문자열
 */
export function toComma(value: number, unit?: string): string;
```

## 소스 코드 주석 정책 (제출용 레포 — 엄격 적용)

이 레포는 사전과제 제출물이라 소스 코드를 채용 담당자가 직접 읽는다. 기본은 **무주석** — 시스템 원칙("WHY가 비자명할 때만")보다 엄격하게 적용한다.

**절대 금지** (발견 즉시 제거):
- 작업 과정/세션 서사 — "재검증", "발견", "수정함", 날짜, PAAR 같은 의사결정 로그성 표현
- Figma 노드 ID, 외부 REST API 조회 근거 등 조사 과정 기록
- 다른 프로젝트·조직·레포 이름 (참고했더라도 소스에는 남기지 않음)

**허용** (극히 예외적, 짧게):
- 브라우저/라이브러리 특이 동작 우회처럼 코드만 봐서는 알 수 없는 WHY — 예: `// Safari focus 유실 방지`
- 과정 설명이 아니라 **현재 코드의 제약 사실**만 서술

과정·근거·의사결정 기록은 `.docs/plans/`(plan+backlog), 세션 리포트, README "AI 협업 방식" 섹션에만 남긴다.

## 테스트

- Vitest + @testing-library/react, API mock은 MSW로 카카오 응답을 재현
- 테스트 설명은 한글
- E2E는 Playwright (검색 → 결과 렌더 → 찜 토글 흐름)

```typescript
describe("useBookSearch", () => {
  it("검색어 입력 시 documents를 렌더한다 (한글)", () => {
    // arrange → act → assert
  });
});
```
