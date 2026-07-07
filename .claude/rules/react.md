---
description: "React 규칙 — deps 최대 2개, useEffect 최소화, Handler/Memo 패턴, 브라우저 API 환경 가드, Form Controller 통일"
paths:
  - "src/**/*.tsx"
  - "src/**/hooks/**/*.ts"
  - "src/**/*.ts"
---

# React 규칙

## 참조 안정성

Hook이나 헬퍼 함수에서 배열/객체를 반환할 때 반드시 `useMemo`/`useCallback`으로 감싸서 참조 안정성 보장. 매 렌더마다 새 참조 생성 금지.

```typescript
// ❌ 매 렌더마다 새 배열 생성 → 소비자 측에서 무한 루프 위험
const useFavoriteBooks = (books: Book[], ids: string[]) => {
  return books.filter((b) => ids.includes(b.isbn));
};

// ✅ useMemo로 참조 안정성 보장
const useFavoriteBooks = (books: Book[], ids: string[]) => {
  return useMemo(() => books.filter((b) => ids.includes(b.isbn)), [books, ids]);
};
```

## Hook 의존성 최소화

- `useEffect`, `useMemo`, `useCallback`의 deps는 **최대 2개**, 가능하면 **1개**
- 의존성이 많으면 디버깅과 동작 예측이 어려움 → 로직 분리 또는 구조 재설계
- `useEffect` 사용 **최소화** — 이벤트 핸들러, 파생 상태(useMemo), handler 객체 패턴으로 대체

```typescript
// ❌ 의존성 3개 이상
useEffect(() => {
  searchBooks(query, sort, page);
}, [query, sort, page]);

// ✅ 하나의 파생 값으로 통합 — 대개 React Query가 이를 대신함
const params = useMemo(() => ({ query, sort, page }), [query]);

// ✅ 더 나은 방법 — useEffect 대신 React Query key로 파라미터 반응
const booksQuery = useBookSearchQuery({ query, sort, page });
```

### useEffect 개수 가이드 (page-level hook)

페이지 단위 훅(`useBookSearch`, `useFavorites` 등)에서 useEffect 3개 이상 = **code smell**. 비동기 race + cleanup 누락 + 라이프사이클 모호함이 누적된다.

| useEffect 개수 | 진단                                                                  |
| -------------- | --------------------------------------------------------------------- |
| 0              | 이상적 — 모든 비동기/외부 동기화가 React Query/이벤트 핸들러로 처리됨 |
| 1~2            | 정상 — mount cleanup + 단일 트리거 패턴                               |
| 3+             | 🚨 리팩토링 신호 — 아래 단계로 통합                                   |

**3개+ 발견 시 통합 절차:**

1. **외부 데이터 fetch** → `useQuery`/`useMutation`로 이전 (useEffect + setState 패턴 제거)
2. **여러 상태 동기화** → derived state(`useMemo`) + 단일 트리거 useEffect로 통합
3. **ref/state 동시 갱신** → 콜백 ref 미러 패턴으로 대체 가능한지 검토
4. **외부 라이브러리 init/destroy** → mount cleanup useEffect 1개에 집약

#### 사례 (도서 검색)

`useBookSearch`가 검색 결과 fetch를 `useEffect + setState`로 하고 있으면 `useBookSearchQuery`(React Query)로 이전한다. URL 필터(nuqs)가 바뀌면 queryKey가 바뀌며 자동 refetch되므로 검색용 useEffect는 0개가 이상적이다.

## 브라우저 API 환경 가드

이 앱은 CSR이지만 브라우저 API(localStorage 등) 접근 시 **환경 가드는 유지**한다 — 테스트가 node 환경(Vitest)에서 훅을 실행하고, 향후 SSR/프리렌더 도입 여지도 있기 때문. 찜 목록을 `localStorage`로 유지하면 초기 읽기에서 특히 주의:

```typescript
if (typeof window === "undefined") return defaultValue;

// 찜 목록 초기값 — window 부재(node 테스트 등) 방어
const readFavorites = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem("favorites") ?? "[]");
  } catch {
    return [];
  }
};
```

## Handler / Memo 객체 패턴

파생 상태는 memo 객체, 비즈니스 로직 함수는 handler 객체로 분리. **단독 useMemo/useCallback 금지 — 반드시 객체 안에 배치.**

```typescript
// ✅ memo 객체 — useMemo가 필요한 항목만 (객체/배열 등 참조 안정성 필요한 것)
const searchMemo = {
  favoriteBooks: useMemo(() => documents.filter((b) => favoriteIds.includes(b.isbn)), [documents, favoriteIds]),
};

// ❌ boolean/string primitive에 useMemo 사용 — 불필요 (값 동일성으로 비교됨)
const searchMemo = {
  hasResults: useMemo(() => documents.length > 0, [documents]),
};
// ✅ primitive는 그냥 계산
const hasResults = documents.length > 0;

// ✅ handler — 기본은 일반 함수. useCallback은 필요한 경우만
const favoriteHandler = {
  toggle: (isbn: string) => {
    setFavorites((prev) => (prev.includes(isbn) ? prev.filter((id) => id !== isbn) : [...prev, isbn]));
  },
};

// useCallback 사용 조건 (둘 중 하나):
// 1. React.memo 자식 컴포넌트에 전달 — 참조 안정성이 리렌더 방지에 직접 연결될 때
// 2. useEffect deps에 함수가 포함될 때
//
// 사용 불필요:
// - 일반 DOM 이벤트 핸들러 (onClick, onChange)
// - 이미 인라인 화살표 () => fn(id) 로 래핑되는 경우
// - 자식이 React.memo 아닌 경우

// ❌ useMemo로 객체 자체를 감싸지 않기 (depth 증가, 개별 deps 관리 불가)
// ❌ 단독 useMemo/useCallback 금지 — 반드시 xxxMemo/xxxHandler 객체 안에
```

### Promise는 async/await — void 금지

`void promise.then(...)` 패턴 금지. `async/await`으로 변환하여 제어 흐름을 명시적으로.

```ts
// ❌ void + .then()
onSearch: () => {
  void form.trigger("query").then((valid) => { if (valid) applyQuery(); });
},

// ✅ async/await
onSearch: async () => {
  const valid = await form.trigger("query");
  if (!valid) return;
  applyQuery();
},
```

### tsx에서 useCallback 재래핑 금지

훅/Context에서 이미 정의된 핸들러를 **컴포넌트에서 다시 `useCallback`으로 감싸지 않는다**. 참조 안정성은 훅에서 이미 보장됨 — 재래핑은 순수 비용.

```tsx
// ❌ 이중 래핑
const { searchHandler } = useSearchContext();
const handleSort = useCallback(() => searchHandler.setSort("latest"), [searchHandler]);

// ✅ 직접 바인딩 — 훅의 handler 객체 참조를 그대로 사용
const { searchHandler } = useSearchContext();
<Dropdown onChange={searchHandler.setSort} />
```

**인자 매핑이 필요할 때만 인라인 화살표:**
```tsx
// ✅ book.isbn 같은 렌더 시점 값 주입은 인라인 화살표 허용 (useCallback 불필요)
<Button onClick={() => favoriteHandler.toggle(book.isbn)} />
```

### Mutation/비동기 액션 객체 리턴 패턴

> 도서 검색 앱은 카카오 API가 읽기 전용이라 서버 mutation이 없고, 찜은 localStorage 로컬 상태다. mutation을 도입하는 경우(예: 백엔드 프록시에 찜 저장)만 아래 패턴을 적용한다.

**단일 mutation**: 객체를 직접 리턴하여 page에서 `.isPending` 접근.
**복수 mutation**: `isMutating` boolean을 hook에서 계산 후 반환 — page에서 여러 `.isPending` 조합은 금지.

```typescript
// ✅ 단일 mutation — 객체 직접 리턴
const useXxx = () => {
  const xxxMutation = useXxxMutation();
  return { xxxMutation, xxxHandler };
};
// page: <Button isLoading={xxxMutation.isPending} />

// ❌ memo 객체에서 isPending wrapping
const xxxMemo = { isSubmitting: mutation.isPending };
```

## 에러 처리

```typescript
// Context — throw로 명확한 에러
const context = useContext(SearchContext);
if (!context) throw new Error("SearchContext를 Provider 안에서 사용하세요");

// 유틸리티 — 방어적 반환 (throw 금지)
if (!isbn) return undefined;

// 에러 상수 — as const 객체로 관리
export const SEARCH_ERRORS = {
  CONTEXT_NOT_FOUND: "...",
} as const;
```

## UI 컴포넌트 패턴 (`components/**`)

자체 UI 컴포넌트(`components/ui/**`) 작성 시 Hook 내부 순서:

1. Props 구조분해
2. Refs
3. State
4. Effects
5. Memo 객체 (`{component}Memo`)
6. Handler 객체 (`{component}Handler`)
7. Return

Compound Component — intersection type + property 할당:

```typescript
const Dropdown = DropdownRoot as typeof DropdownRoot & {
  Trigger: typeof DropdownTrigger;
  Content: typeof DropdownContent;
};
Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
```

### Layout-level Compound — Children 슬롯 분류

레이아웃 컴포넌트가 슬롯 4개 이상 또는 옵셔널 다수일 때 props 대신 Compound로 전환. **자식 작성 순서와 무관하게 정해진 시각 순서를 자동 강제**한다.

**적용 기준** (둘 중 하나 충족):
- 슬롯 ≥ 4개 (예: SearchLayout = Header/Filters/Toolbar/Results)
- 옵셔널 슬롯 ≥ 3개 — props가 모두 `?` 붙으면 Compound로 호출자가 슬롯 의도를 명시

**슬롯 분류 패턴** — `React.Children.forEach` + `child.type` 매칭으로 슬롯 키 결정:

```tsx
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";

const SearchLayoutHeader = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
const SearchLayoutResults = ({ children }: { children: ReactNode }) => <section>{children}</section>;
// (Filters / Toolbar 동일 패턴)

const SearchLayoutRoot = ({ children }: { children: ReactNode }) => {
  const slots: Record<"header" | "filters" | "toolbar" | "results", ReactElement | null> = {
    header: null, filters: null, toolbar: null, results: null,
  };

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const slotKey =
      child.type === SearchLayoutHeader  ? "header"  :
      child.type === SearchLayoutFilters ? "filters" :
      child.type === SearchLayoutToolbar ? "toolbar" :
      child.type === SearchLayoutResults ? "results" : null;
    if (!slotKey) {
      if (process.env.NODE_ENV !== "production") console.warn("[SearchLayout] Unknown child");
      return;
    }
    slots[slotKey] = child;
  });

  // 시각 순서를 코드 순서로 박제 — 자식 작성 순서 무시
  return (
    <div>
      {slots.header}
      {slots.filters}
      {slots.toolbar}
      {slots.results}
    </div>
  );
};

const SearchLayout = SearchLayoutRoot as typeof SearchLayoutRoot & {
  Header: typeof SearchLayoutHeader;
  Filters: typeof SearchLayoutFilters;
  Toolbar: typeof SearchLayoutToolbar;
  Results: typeof SearchLayoutResults;
};
SearchLayout.Header = SearchLayoutHeader;
SearchLayout.Filters = SearchLayoutFilters;
SearchLayout.Toolbar = SearchLayoutToolbar;
SearchLayout.Results = SearchLayoutResults;
```

**필수 의무**:
- **동일 파일 export** — sub-component(`SearchLayoutHeader` 등)를 별도 파일로 분리하면 `child.type === SearchLayoutHeader` 매칭이 항상 false가 된다(다른 파일 import 시 React가 별도 모듈로 처리). Root와 같은 파일에서 정의 + property 할당이 의무.
- **dev warning은 NODE_ENV 가드** — `process.env.NODE_ENV !== "production"` 분기 안에서만 `console.warn` 호출.
- **미사용 슬롯은 DOM 미렌더** — `slots[key]`가 `null`이면 React가 자동으로 무시한다.

Hook 분리 원칙:

- 한 hook이 여러 mode/type을 처리하면 분리 (예: `useCheckbox` + `useCheckboxGroup`)
- Group/개별 로직이 한 hook에 혼재되면 Context 영역과 개별 로직 분리

기타 규칙:

- Context 타입은 Hook 반환 타입에서 추론 (`type XxxContextValue = ReturnType<typeof useXxx>`)
- `forwardRef` 미사용 — `ref`를 Props로 직접 전달
- 코드 영역 구분은 `// ====...` 주석 사용
- 아이콘만 있는 Button (isLoading 포함)에는 반드시 `aria-label` 필수

## Page-level Context Provider 패턴

**적용 범위**: 단일 page 안에서 hook 결과(query data + handler)를 자식 컴포넌트(SearchBar/BookList 등)와 공유해야 하는 경우. 페이지 수직 슬라이스(`page.md`)의 핵심.

**구조 — hook 파일에 hook + Context + useContext 통합 export**:

```ts
// src/pages/SearchPage/hooks/useSearch.ts  ← JSX 없음(createContext는 함수 호출). Provider JSX는 SearchPage.tsx에
import { createContext, useContext } from "react";
import { EMPTY_BOOK_SEARCH, useBookSearchQuery } from "@/lib/api/books/api.queries";

type SearchContextValue = ReturnType<typeof useSearch>;

const SearchContext = createContext<SearchContextValue | null>(null);

const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("SearchContext를 Provider 안에서 사용하세요");
  return ctx;
};

const useSearch = () => {
  // nuqs 필터 + useBookSearchQuery + searchHandler ...
  const booksQuery = useBookSearchQuery(/* params */);
  const data = booksQuery.data ?? EMPTY_BOOK_SEARCH;
  return { booksQuery, data /*, filters, searchHandler */ };
};

export { useSearch, SearchContext, useSearchContext };
```

**선언 순서 — 고정**:

1. imports
2. `type {Domain}ContextValue = ReturnType<typeof use{Domain}>`
3. `const {Domain}Context = createContext<... | null>(null)`
4. `use{Domain}Context` (Context consumer)
5. `use{Domain}` (실제 hook 구현)
6. `export { ... }`

```tsx
// src/pages/SearchPage/SearchPage.tsx — page가 useSearch() 호출 + SearchContext.Provider 명시
const SearchPage = () => {
  const value = useSearch();

  return (
    <SearchContext.Provider value={value}>
      <SearchScreen />
    </SearchContext.Provider>
  );
};
```

**규칙**:

- **별도 `SearchContext.tsx` 파일 분리 금지** — `useSearch.ts`에 통합(응집도). hook과 Context는 한 생명 주기 + 통합 export
- **파일 확장자 `.ts` 유지** — Provider 래퍼를 만들지 않으므로 hook 파일에 JSX 없음. Provider JSX 사용은 호출처(`{Name}Page.tsx`)에서
- **Provider 래퍼 컴포넌트(`SearchProvider`) 만들지 않음** — page에서 `<SearchContext.Provider value={value}>` 명시. 이유: (1) 래퍼는 의미 없는 한 줄 wrap, (2) page에서 hook 호출 위치가 명시적이라 value 출처 즉시 식별, (3) hook 파일을 `.ts`로 유지 가능
- **value 타입 = `ReturnType<typeof useSearch>`** — handler 추가 시 자동 확장, 명시 interface 중복 정의 불필요
- **컴포넌트 export는 OK** — 단 hook 반환값에는 React 컴포넌트 포함 금지 (value는 데이터/함수만)
- **null sentinel + throw** — Provider 밖 호출 시 명확한 에러로 빠르게 실패
- 한 페이지 안에서 단순한 흐름(자식 분리 없음)이면 Context 없이 page에서 직접 hook 호출 — 본 패턴은 자식 2개 이상 시

## 모달 컴포넌트 패턴

> 도서 검색 앱의 대표 모달은 **상세검색 모달**(제목/저자/출판사 target + 검색어 필터 폼)이다. 서버 mutation이 없으므로 폼은 값 적용(apply) + 닫기로 완결한다.

**분리 원칙**:

- **State/Form 관리 위치** — 모달의 form/handler는 페이지 슬라이스의 `src/pages/{Name}Page/hooks/` 아래 hook 또는 페이지 Context에 둔다. `components/` 하위에는 hook 파일을 만들지 않는다. 모달 컴포넌트는 Context/props를 **소비만** 한다.
- 필드 ≤ 2개의 단순 모달은 컴포넌트 내부 `useForm` 직접 사용 허용.

**Lifecycle**:

- `if (!open) return null;` early return — form 자동 unmount/reset
- page hook은 `modal: { detailSearch: boolean }` 같은 toggle state만 관리

**Props 시그니처**:

- 최소 props: `{ open: boolean; onClose: () => void; }`
- 데이터 프리필이 필요한 모달은 `target: {...} | null` 패턴 — target null이면 미렌더, target 변경 시 `useEffect`로 form.reset 동기화

```tsx
interface DetailSearchModalProps {
  open: boolean;
  onClose: () => void;
}
```

**모달 쉘**: `components/ui/modal`의 자체 Compound 컴포넌트로 통일(ESC·backdrop·scroll lock·focus 복원). 각 모달이 이 로직을 수기 반복하지 않는다. a11y 요건(`role="dialog"`, `aria-modal`, focus trap)은 `accessibility.md` 참조.

## Form 바인딩 — Controller 통일

- `register` 대신 `Controller`로 통일 (Input, Dropdown, Checkbox 등 모든 필드)
- `{...field}` spread 금지 — `value`, `onChange`, `onBlur` 등 전달 props를 **개별 명시** (디버깅 추적 명확)
- `fieldState.error?.message`로 에러 메시지 접근
- **div 기반 컴포넌트(Checkbox, Radio 등)**: `name`, `ref` 전달 불필요 (TS 오류). `onBlur`는 필수, `onChange`는 컴포넌트 API에 맞게 변환

### `name` / `ref` 전달 정책

`name`/`ref`는 **focus 이동·RHF 자동 등록이 필요한 필드에만** 명시한다. 모두 전달이 기본은 아니다.

| 조건 | `name`/`ref` |
| --- | --- |
| 검증 실패 시 해당 필드로 focus 이동(`shouldFocusError`)·`scrollIntoView`가 필요 | **전달** (`ref` 필수, `name` 동반) |
| focus 이동 불필요한 단순 필드 | **생략 가능** (`value`/`onChange`/`onBlur`만) |
| div 기반 컴포넌트(Checkbox, Radio 등) — `name`/`ref` 미지원 | **생략** (TS 오류) |

### Context에 React 컴포넌트 export 금지

`useXxx` hook 반환 값에 `Controller` 같은 React 컴포넌트를 포함시키는 것은 금지. 컴포넌트에서 직접 import한다.

```typescript
// ✅ 각 컴포넌트에서 직접 import
import { Controller } from "react-hook-form";
```

**Why:** React 컴포넌트는 정적 참조이므로 context를 통한 전달이 무의미하다. JSX에서 사용하는 컴포넌트는 파일 상단 import에서 명시적으로 드러나야 한다.

**validation mode 기본값: `onTouched`** — 첫 blur 전: 오류 없음, 이후: onChange 즉시 피드백. `onBlur`은 `onTouched` 모드의 트리거이므로 Controller 바인딩에 **항상 포함**.

```ts
// ✅ useForm 기본 설정
const form = useForm({
  mode: "onTouched",
  resolver: zodResolver(schema),
});
```

```tsx
// ✅ 개별 명시 (props 순서: 시맨틱→상태→힌트→바인딩→이벤트)
<Controller
  control={form.control}
  name="query"
  render={({ field, fieldState }) => (
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
  )}
/>

// ❌ spread — 어떤 props가 전달되는지 숨겨짐
<Input {...field} errorMessage={fieldState.error?.message} />
```

## Zod v4 사용 규약

이 프로젝트는 zod 4.x를 사용한다. v3 deprecated API는 사용 금지.

| 금지 (v3) | 사용 (v4) |
|-----------|-----------|
| `z.string().email()` | `z.email()` |
| `z.string().url()` | `z.url()` |
| `result.error.flatten()` | `z.treeifyError(result.error)` |

- **공통 필드는 `lib/validation/fields.ts`의 `zField` 객체에서 import** — 각 도메인 validation에서 인라인 정의 금지(3곳 이상 반복 시).
- 폼 스키마는 `zodResolver`용으로 정의하고, 폼 전용 파생 필드는 `.extend(...).refine(...)`로 확장.

## React Query 컨벤션

```typescript
// ✅ 구조분해 금지 — 객체 그대로 사용
const booksQuery = useBookSearchQuery(params);

// Query hook 정의: queryKey/queryFn 제외한 나머지 options 오버라이드 가능
// 빈 검색어 게이트: enabled: query.trim().length > 0
// 쿼리 키 팩토리: bookKeys = { all, search(params) } — lib/api/shared/queryKeys.ts
// EMPTY 상수 + placeholderData: 빈 응답 fallback으로 page에서 ?? 없이 접근
```
