---
description: "안티패턴 카탈로그(SOT). 새 코드 작성·리뷰 시 참고하는 ❌ Before → ✅ After + WHY 모음."
paths:
  - "src/**"
---

# 안티패턴 카탈로그

본 문서는 새 코드 작성·리뷰 시 참고하는 **학습·리뷰용 카탈로그**다. 각 항목은 ❌ Before → ✅ After + WHY 형식.

> 한 줄 원칙: **코드는 위에서 아래로 읽혀야 한다.** 분기 깊이·중복 평가·duck typing은 읽는 사람의 시점 이동을 강제한다.

## 카테고리

| ID  | 카테고리            | 적용 범위                         | 출처                            |
| --- | ------------------- | --------------------------------- | ------------------------------- |
| CS  | 조건/분기 단순화    | 전 영역                           | 자체 + FF 가독성                |
| PR  | 예측 가능성         | 전 영역                           | FF 예측 가능성                  |
| EH  | 에러/예외 처리      | `src/lib/api/**`, 시스템 경계      | 자체 + FF 디버깅                |
| RX  | React/페이지        | `src/**/*.tsx`, page hooks        | 자체 + FF 가독성/결합도/디버깅  |
| CH  | 응집도              | 전 영역                           | FF 응집도                       |
| CP  | 결합도              | 전 영역                           | FF 결합도                       |

> FF = `https://frontend-fundamentals.com/code-quality/code/` (토스 frontend-fundamentals, conventions.md 인용 SOT)

---

## CS — 조건/분기 단순화

### CS-1 중첩 삼항 (3단 이상) — Blocking 리뷰

```ts
// ❌ Before — 한 번에 읽기 불가
const sortLabel = sort === "accuracy"
  ? "정확도순"
  : sort === "latest"
    ? "최신순"
    : sort === "title"
      ? "제목순"
      : "정확도순";
```

```ts
// ✅ After — 매핑 객체로 의도만 노출
const SORT_LABEL: Record<string, string> = {
  accuracy: "정확도순",
  latest: "최신순",
  title: "제목순",
};
const sortLabel = SORT_LABEL[sort] ?? "정확도순";
```

**WHY**: 3단 삼항은 좌→우 + 깊이 추적이 동시에 일어나 시점 이동이 강제됨. 매핑 객체/함수 추출하면 호출부 1줄로 의도만 노출.

**대안 결정 트리**: 2단 = 인라인 OK / 3단+ = 매핑 객체 또는 함수 추출 / boolean 1개 = 이름 있는 변수

**관련**: `karpathy-principles.md` 원칙 3(시점 이동 최소화), conventions.md "복잡한 삼항 → IIFE 또는 early return"

---

### CS-2 인라인 AND 조건 체크 (3 항 이상) — Major

```ts
// ❌ Before — 매 조건마다 의도 재구성
if (book && typeof book === "object" && Array.isArray(book.authors)) {
  render(book);
}
```

```ts
// ✅ After — type guard로 의도 캡슐화
const isBook = (v: unknown): v is Book =>
  typeof v === "object" && v !== null && Array.isArray((v as Book).authors);

if (isBook(book)) render(book);
```

**WHY**: AND 조건 3개+ = 이름 있는 술어. type guard는 후속 코드에서 `as` 없이 narrowing.

---

### CS-3 같은 표현식 반복 평가 — Minor

```ts
// ❌ book.sale_price > 0 ? book.sale_price : book.price 가 여러 번
```

```ts
// ✅ 한 번 평가 후 사용
const price = book.sale_price > 0 ? book.sale_price : book.price;
```

---

### CS-4 비교 연산자 방향 — Minor (출처: FF 가독성)

```ts
// ❌ Before — 변수가 양쪽에, 부등호 방향 다름. 머릿속에서 재배열 필요
if (page >= 1 && page <= totalPages) { ... }
```

```ts
// ✅ After — 수학의 부등식처럼 왼→오른쪽으로 읽힘
if (1 <= page && page <= totalPages) { ... }
```

**WHY**: 범위 검사는 시작값 → 검사값 → 끝값 순서로 작성하면 수학 부등식과 동일한 형태가 되어 시점 이동 없이 즉시 읽힘.

**관련**: `conventions.md` 가독성, FF 가독성/`comparison-order`

---

### CS-5 시점 이동 (다른 파일/함수로 점프 강제) — Major (출처: FF 가독성)

```tsx
// ❌ Before — 작은 규칙을 별도 함수/상수로 추출 → 호출부에서 정의로 점프 강제
function BookCard({ book }) {
  const badge = getBadge(book);
  return <span>{badge}</span>;
}
function getBadge(book) { return BADGE_MAP[book.status]; }
const BADGE_MAP = { normal: "정상판매", out_of_print: "품절" };
```

```tsx
// ✅ After — 작은 매핑은 호출부에 인라인 (한 화면에서 완결)
function BookCard({ book }) {
  const badge = { normal: "정상판매", out_of_print: "품절" }[book.status];
  return <span>{badge}</span>;
}
```

**WHY**: 작은 도메인 규칙을 별도 함수/상수로 추출하면 호출부에서 의도를 파악하려고 정의로 점프 필요. 3곳 미만 사용은 인라인 유지(`conventions.md` 최소 추상화) — 시점 이동 비용 > DRY 이득.

**예외**: 매핑이 3곳 이상 공유되거나 크면 상수/함수 추출.

**관련**: `karpathy-principles.md` 원칙 3, `conventions.md` "코드는 위에서 아래로 읽히게"

---

## PR — 예측 가능성 (출처: FF 예측 가능성)

### PR-1 wrapper에 같은 이름 — Major

```ts
// ❌ Before — 라이브러리 http와 동명, 추가 부수효과(토큰 주입) 숨김
import { http as httpLibrary } from "some-http-lib";
export const http = {
  async get(url) {
    return httpLibrary.get(url, { headers: { Authorization: `KakaoAK ${KEY}` } });
  },
};
```

```ts
// ✅ After — axios 인스턴스는 베이스 그대로 export, 헤더 주입은 인스턴스 설정으로
// src/lib/api/index.ts
export const api = axios.create({
  baseURL: "https://dapi.kakao.com",
  headers: { Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}` },
});
```

**WHY**: 같은 이름은 같은 동작을 약속. wrapper가 부수효과(인증/로깅)를 추가했는데 이름이 같으면 호출자가 라이브러리 동작을 가정하고 디버깅 시점에 차이 발견. axios 인스턴스는 설정으로 헤더를 주입하고 이름은 `api`(베이스)로 명확히.

---

### PR-2 같은 종류의 함수가 반환 타입 다름 — Major

```ts
// ❌ Before
function useBookSearch() { return booksQuery; }          // Query 객체
function useFavorites()  { return favoritesQuery.data; } // data만 unwrap

function checkIsQueryValid(q) { return isValid; }                    // boolean
function checkIsPageValid(p)  { return { ok: false, reason: "..." }; } // 객체
```

```ts
// ✅ After — 한 가족이면 같은 형태
function useBookSearch() { return booksQuery; }
function useFavorites()  { return favoritesQuery; }   // 둘 다 Query 객체

function checkIsQueryValid(q) { return { ok: true | false, reason?: string }; }
function checkIsPageValid(p)  { return { ok: true | false, reason?: string }; }
```

**WHY**: 같은 prefix(`use*`, `check*`, `is*`) 함수가 다른 shape을 반환하면 사용자가 호출 전에 시그니처 확인 필요. 일관성 = 예측 가능성.

**적용**: React Query 훅은 모두 query 객체 그대로 반환(`react.md` "구조분해 금지"). 검증/판별 함수는 `{ ok, reason? }` 등 한 가족 shape 통일.

**관련**: `react.md` "Mutation 객체 리턴 패턴", FF 예측 가능성/`use-user`

---

### PR-3 함수에 숨은 부수효과 — Major

```ts
// ❌ Before — getBookList가 로깅까지 — 이름에 안 드러남
async function getBookList(params): Promise<Response<BookData>> {
  const res = await api.get("/v3/search/book", { params });
  logging.log("search_performed");  // 숨은 로직
  return res.data;
}
```

```ts
// ✅ After — api 함수는 순수, 부수효과는 호출부/React Query 콜백에서 명시
// src/lib/api/books/api.ts
async function getBookList(params): Promise<Response<BookData>> {
  const res = await api.get("/v3/search/book", { params });
  return res.data;
}
// 로깅이 필요하면 useBookListInfiniteQuery 콜백 또는 이벤트 핸들러에서
```

**WHY**: 함수 이름과 반환 타입으로 예측되지 않는 동작(로깅/스토리지 쓰기 등)이 안에 숨어 있으면 호출자가 디버깅 시 추적 어려움. 부수효과는 호출부에서 명시적으로. `src/lib/api/{domain}/api.ts`는 axios 호출만 — Toast 등은 React Query `onSuccess`/이벤트 핸들러에서.

**관련**: FF 예측 가능성/`hidden-logic`

---

## EH — 에러/예외 처리

### EH-1 duck typing 헬퍼로 에러 분기 — Major

```ts
// ❌ Before — Like interface + 이름 패턴 검사
const isAppError = (e: unknown): boolean =>
  e instanceof Error && (e as { code?: unknown }).code !== undefined && e.name.endsWith("AppError");

if (isAppError(e)) { ... }
```

```ts
// ✅ After — 베이스 클래스 + instanceof 한 줄
export class AppError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "AppError";
  }
}

if (e instanceof AppError) { showToast(e.message); }
```

**WHY**: duck typing은 **클래스명 문자열 검사**(`name.endsWith`)에 의존 — 리네임/번들러 mangling 시 silent fail. 베이스 클래스 `instanceof`는 컴파일러 + 런타임 prototype chain 양쪽이 보장.

**도메인별 에러는 `extends AppError`**:
```ts
export class RateLimitError extends AppError {
  constructor() { super("RATE_LIMIT", "잠시 후 다시 시도해주세요"); }
}
```

---

### EH-2 발생할 수 없는 에러 핸들링 — Minor

```ts
// ❌ 내부 함수 호출에 try/catch (이미 상위/React Query가 잡음)
try {
  const res = await getBookList(params);
} catch (e) {
  console.error(e);
  throw e;
}
```

```ts
// ✅ 시스템 경계(외부 API 호출, 사용자 입력)에서만 처리 — 대개 React Query onError에 위임
const booksQuery = useQuery({
  queryKey: bookKeys.list(params),
  queryFn: () => getBookList(params),
});
// 에러 표시는 onError(Toast) 또는 error boundary
```

**WHY**: 내부 → 외부 throw는 자연 전파. 중간 catch는 stack trace 오염 + 진짜 처리 위치 흐림. 클라이언트 데이터 fetch는 React Query가 에러 상태를 관리한다.

**관련**: `karpathy-principles.md` 원칙 2, CLAUDE.md "발생할 수 없는 시나리오 에러 처리 금지"

---

### EH-3 표면 증상 마스킹 — Major (출처: FF 디버깅/수정)

```ts
// ❌ Before — type assertion / 빈 default / try-catch swallow로 증상만 가림
const authors = (book as any).authors;               // type assertion 우회
const documents = (res.data as Book[]) ?? [];        // shape 잘못, default로 가림
try { window.localStorage.setItem("favorites", v); } catch {}  // 에러 무시 — silent fail
```

```ts
// ✅ After — 근본 원인 명시 검증
if (!book || !Array.isArray(book.authors)) throw new Error("잘못된 도서 응답 shape");
const documents = res.data?.documents ?? [];         // 실제 shape 확인 후 정확한 경로

try {
  window.localStorage.setItem("favorites", v);
} catch (e) {
  console.error("favorites_persist_failed", e);      // 명시 로깅 (용량 초과 등 실제 케이스)
}
```

**WHY**: 표면을 가리면 같은 버그가 다른 곳에서 재발. "안 깨졌다"가 아니라 "왜 깨졌는지" 알아야 안정. type assertion은 컴파일러 체크를 끄는 escape hatch.

**근본 원인 처방**:
- `undefined` → 데이터 존재 명시 검증 + optional chaining
- race condition → debounce 대신 `AbortController` (in-flight 취소)
- 잘못된 generic → React Query `select`로 변환 (`RX-7`)

**관련**: FF 디버깅/`correct.html`

---

## RX — React/페이지

### RX-1 `{Name}Page.tsx`에 useState/useMutation 직접 — Major

```tsx
// ❌ SearchPage.tsx 안에서 필터/상태 보유
const SearchPage = () => {
  const [query, setQuery] = useState("");
  const booksQuery = useBookListInfiniteQuery({ query });
  // ...
};
```

```tsx
// ✅ hooks/useSearch.ts로 분리 (Context value 생성)
const SearchPage = () => {
  const value = useSearch();
  return (
    <SearchContext.Provider value={value}>
      <SearchScreen />
    </SearchContext.Provider>
  );
};
```

**WHY**: `{Name}Page.tsx`는 **얇은 조립**만, 비즈니스 로직은 hook. 수직 슬라이스(page/hooks/components/styles) SOT는 `page.md`.

**관련**: `react.md` "Page-level Context Provider 패턴", `page.md`

---

### RX-2 React Query 구조분해 — Major

```ts
// ❌ 구조분해 — refetch/isPending/error 등을 매번 추가 destructure
const { data } = useBookListInfiniteQuery(params);
```

```ts
// ✅ 객체 그대로
const booksQuery = useBookListInfiniteQuery(params);
// booksQuery.data, booksQuery.isPending, booksQuery.refetch ...
```

**WHY**: query 객체는 12+ 필드 — 구조분해는 일부만 노출. 객체 그대로 두면 IDE 자동완성 + 변경 시 추가 분해 불필요.

**관련**: `react.md` "React Query 컨벤션"

---

### RX-3 mutateAsync + try/catch (wrapper 중복) — Major

> 도서 검색 앱은 서버 mutation이 없다. 백엔드 프록시에 찜 저장 등 mutation을 도입할 때만 적용.

```ts
// ❌ mutateAsync — wrapper의 onSuccess/onError와 중복
const onSave = async (v) => {
  try {
    await saveMutation.mutateAsync(v);
    Toast.success("저장되었습니다");   // wrapper가 이미 띄움
  } catch (e) {
    Toast.error("실패");               // wrapper가 이미 띄움
  }
};
```

```ts
// ✅ mutate + mutate-time onSuccess
const onSave = (v) => {
  saveMutation.mutate(v, { onSuccess: () => router.back() });
};
```

**WHY**: wrapper hook이 invalidate + Toast를 onSuccess/onError에서 처리. `mutateAsync` + try/catch는 그 책임을 페이지로 끌어와 중복 + unhandled rejection 위험.

---

### RX-4 분기별로 다른 컴포넌트를 한 함수에 — Major (출처: FF 가독성)

```tsx
// ❌ Before — 찜/비찜 두 흐름이 한 컴포넌트에 섞임
function FavoriteButton({ book }) {
  const isFavorite = useIsFavorite(book.isbn);
  useEffect(() => {
    if (!isFavorite) return;       // 비찜은 effect 안 돔
    playFillAnimation();
  }, [isFavorite]);
  return isFavorite ? <FilledHeart /> : <EmptyHeart />;
}
```

```tsx
// ✅ After — 분기별로 컴포넌트 완전 분리
function FavoriteButton({ book }) {
  const isFavorite = useIsFavorite(book.isbn);
  return isFavorite ? <ActiveFavorite book={book} /> : <InactiveFavorite book={book} />;
}
```

**WHY**: 동시에 실행되지 않는 코드가 한 함수에 있으면 `if (...) return` guard가 흩어지고 effect deps에 분기 조건이 들어가 추론 비용 ↑.

**판단**: 분기마다 다른 hook/effect/스타일이 3개+ 있으면 분리. 단순 JSX 분기는 인라인 유지.

**관련**: `conventions.md` "동시에 실행되지 않는 코드는 분리", FF 가독성/`submit-button`

---

### RX-5 광범위 책임 Hook (5 책임+) — Major (출처: FF 가독성·결합도)

```ts
// ❌ Before — useSearch가 query, sort, page, target, favorites, modal 모두 보유
const useSearch = () => {
  // 검색 필터 + 찜 상태 + 모달 토글 + ... 무관한 책임 혼재
};
```

```ts
// ✅ After — 무관한 책임은 분리
const useSearch = () => { /* 검색 필터 + 결과 쿼리만 */ };
const useFavorites = () => { /* 찜 로컬 상태만 */ };
// 필터가 여러 축이면 nuqs useQueryStates 하나로 묶되, 찜/모달 등 다른 도메인은 분리
```

**WHY**: 책임이 많은 hook은 한 곳 수정이 다른 곳 리렌더 트리거 + deps 폭발 + 테스트 어려움. 책임별 분리하면 영향 범위 국소화.

**판단**: hook 반환 객체에 **무관한 책임 3가지+** 섞여 있으면 분리. 동일 도메인 상태(검색 필터 필드 모음 등)는 묶어도 OK.

**관련**: `react.md` "Hook 분리 원칙", FF 결합도/`use-page-state-coupling`

---

### RX-6 구현 상세를 페이지에 노출 — Major (출처: FF 가독성)

```tsx
// ❌ Before — 페이지가 로딩/에러 분기 + 재시도 로직까지 인라인 보유
function SearchPage() {
  const booksQuery = useBookListInfiniteQuery(params);
  if (booksQuery.isError) { /* 재시도 UI 인라인 */ }
  return <>{/* ... */}</>;
}
```

```tsx
// ✅ After — 횡단 관심사를 wrapper/경계로 추출
// 시스템 에러 → react-router errorElement / ErrorBoundary, 빈 결과 → 리스트 empty prop
function SearchPage() {
  const value = useSearch();
  return <SearchContext.Provider value={value}><SearchScreen /></SearchContext.Provider>;
}
```

**WHY**: 페이지는 화면 구성만, 에러바운더리·로깅 같은 횡단 관심사는 wrapper/라우트 경계로. 페이지를 읽을 때 한 번에 들어오는 맥락 수 감소.

**적용**: 시스템 에러는 react-router 라우트의 `errorElement`(또는 상위 `ErrorBoundary`), 없음 상태는 리스트/컴포넌트 `empty` prop으로 위임(`RX-13`).

**관련**: `conventions.md` "구현 상세 숨기기", FF 가독성/`login-start-page`

---

### RX-7 React Query type assertion 우회 — Major (출처: FF 디버깅)

```ts
// ❌ Before — generic 3번째 인자로 실제 shape과 다른 타입 강제
const { data } = useQuery<Response<BookData>, Error, BookData[]>({ queryKey, queryFn });
data.some(...);  // 런타임 오류 — data는 사실 { documents, meta } 객체
```

```ts
// ✅ After — select로 변환
const booksQuery = useQuery<Response<BookData>, Error, BookData[]>({
  queryKey, queryFn,
  select: (res) => res.documents,
});
booksQuery.data?.some(...);  // 안전
```

**WHY**: generic 3번째는 select **이후** 타입. 자의 변경은 런타임과 분리. React Query 표준은 `select`로 변환 + 타입 자동 추론.

**관련**: `RX-2`, `react.md` "React Query 컨벤션", FF 디버깅/`react_query_refetch_typescript`

---

### RX-8 react-hook-form silent fail — Major (출처: FF 디버깅/rhf-zod)

```tsx
// ❌ Before — onError 누락. zod transform 실패 시 onSubmit 호출 X = 사용자 피드백 0
<form onSubmit={handleSubmit(onSubmit)}>
```

```tsx
// ✅ After — onError 양쪽 핸들러 + 로깅
<form onSubmit={handleSubmit(onSubmit, onError)}>

const onError = (errors) => {
  console.warn("form_validation_failed", errors);
  Toast.error("입력값을 확인해주세요");
};
```

**WHY**: zod `transform`이 schema 불일치로 실패하면 RHF는 onSubmit을 건너뜀 — UI에 아무 변화 없어 혼란. `onError`로 양쪽 경로 명시.

**예방**: form values 타입과 zod schema input 타입 일치 확인 (`react.md` Zod v4 + Form 패턴).

**관련**: FF 디버깅/`react_hook_form_zod`

---

### RX-9 useState closure stale (제어 변수) — Major (출처: FF 디버깅/state-closure)

```ts
// ❌ Before — setIsLoading은 비동기. 같은 tick 내 중복 호출 시 closure가 옛 false 봄
const [isLoading, setIsLoading] = useState(false);
const handleClick = async () => {
  if (isLoading) return;   // closure가 false
  setIsLoading(true);
  await callApi();         // 중복 호출 발생
  setIsLoading(false);
};
```

```ts
// ✅ After — UI 노출은 useState, 제어 변수는 useRef (동기 갱신)
const [isLoading, setIsLoading] = useState(false);
const isLoadingRef = useRef(false);
const handleClick = async () => {
  if (isLoadingRef.current) return;
  isLoadingRef.current = true;
  setIsLoading(true);
  try { await callApi(); }
  finally {
    isLoadingRef.current = false;
    setIsLoading(false);
  }
};
```

**WHY**: useState는 비동기 + 새 closure 생성까지 시간차. 동시 호출 방지·중복 제거 같은 **로직 제어**는 ref로. UI 표시(스피너 등)는 state.

**관련**: `react.md` "참조 안정성", FF 디버깅/`react_state_closure`

---

### RX-10 고빈도 이벤트에 setState — Major (출처: FF 디버깅/rerendering-performance)

```tsx
// ❌ Before — 스크롤(무한 스크롤 결과 목록)마다 setState → React 재렌더 폭증
const handleScroll = (e) => setScrollTop(e.target.scrollTop);
```

```tsx
// ✅ After — 스크롤 중엔 ref, 임계 도달 시에만 상태/다음 페이지 트리거
const handleScroll = (e) => {
  const el = e.currentTarget;
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
    searchHandler.setPage(page + 1);   // 다음 페이지 1회 트리거
  }
};
```

**WHY**: 고빈도(40Hz+) setState = 재렌더 + reconciliation 폭증. 스크롤/드래그/마우스무브는 ref + 임계 트리거로. 일반 클릭은 setState OK.

**관련**: FF 디버깅/`react_rerendering_performance`

---

### RX-11 useEffect cleanup 누락 — Major (출처: FF 디버깅/unmount-cleanup)

```ts
// ❌ Before — IntersectionObserver / EventListener cleanup 없음 → 메모리 누수 + 중복 핸들러
useEffect(() => {
  const observer = new IntersectionObserver(onIntersect);
  observer.observe(sentinelRef.current);
  window.addEventListener("resize", handleResize);
}, []);
```

```ts
// ✅ After — return cleanup
useEffect(() => {
  const observer = new IntersectionObserver(onIntersect);
  const controller = new AbortController();
  if (sentinelRef.current) observer.observe(sentinelRef.current);
  window.addEventListener("resize", handleResize, { signal: controller.signal });

  return () => {
    observer.disconnect();
    controller.abort();
  };
}, []);
```

**WHY**: unmount 후에도 살아남는 구독 = 메모리 누수 + 사라진 컴포넌트 setState(warning). ESLint `react-hooks/exhaustive-deps` 활성화.

**관련**: `react.md` "useEffect 개수 가이드", FF 디버깅/`react_unmount_cleanup`

---

### RX-12 React Query data를 useMemo로 재가공 — Major

```ts
// ❌ Before — useBookListInfiniteQuery 결과를 다시 memo 객체로 가공
const useSearch = () => {
  const booksQuery = useBookListInfiniteQuery(params);
  const searchMemo = {
    documents: useMemo(() => booksQuery.data?.documents ?? [], [booksQuery.data]),
    totalCount: booksQuery.data?.meta.total_count ?? 0,
  };
  return { booksQuery, searchMemo };
};
```

```ts
// ✅ After — query 그대로 반환. fallback은 ?? EMPTY narrowing 한 줄
const useSearch = () => {
  const booksQuery = useBookListInfiniteQuery(params);
  const data = booksQuery.data ?? EMPTY_BOOK_LIST;
  return { booksQuery, data };
};
// page: data.documents, data.meta.total_count 직접 사용
```

**WHY**: React Query는 같은 응답에 대해 동일 reference를 유지(structural sharing). data 자체가 stable이라 다시 `useMemo`로 감싸면 (1) 무의미한 의존성 추적 비용, (2) hook 반환이 query + memo로 혼재되어 `PR-2` 위반, (3) `total_count` 같은 1차 derived는 인라인이 자연스러움. **TS narrowing(`?? EMPTY`) + `placeholderData`** 조합으로 page에서 `?? []` 없이 직접 접근 가능.

**보조 처방**: `src/lib/api/books/api.queries.ts`에 `EMPTY_BOOK_LIST` 상수 + `placeholderData: keepPreviousData` → hook은 `?? EMPTY`로 narrowing. `useInfiniteQuery.data`는 타입상 항상 `TData | undefined`라 **함수형 placeholderData로 초기값을 넣어도 소비처 `??`를 못 없앤다** — `keepPreviousData + ?? EMPTY`가 `??` 최소 + 소비 컴포넌트 0개.

**관련**: `RX-2`, `react.md` Handler/Memo 객체

---

### RX-13 page에 isPending/isError/empty UI 분기 직접 박기 — Major

```tsx
// ❌ Before — page가 로딩/에러/빈상태 분기를 모두 보유
const SearchPage = () => {
  const { booksQuery, data } = useSearch();
  return (
    <>
      {booksQuery.isPending && <Loading />}
      {booksQuery.isError && <div>오류</div>}
      {data.documents.length === 0 && <Empty />}
      {data.documents.length > 0 && <BookList books={data.documents} />}
    </>
  );
};
```

```tsx
// ✅ After — empty는 리스트 컴포넌트 prop, 시스템 에러는 react-router errorElement로 위임
const SearchScreen = () => {
  const { data } = useSearchContext();
  return <BookList books={data.documents} empty="검색 결과가 없습니다" />;
};
```

**WHY**: (a) 비즈니스 에러는 React Query `onError` → Toast, (b) 빈 상태는 리스트 컴포넌트 `empty` prop, (c) 시스템 에러(5xx, 네트워크 단절)는 react-router 라우트의 `errorElement`(또는 상위 `ErrorBoundary`) — **page가 분기를 박으면 같은 책임이 여러 곳에 흩어진다**.

**판단 기준**:
- 빈 상태 표시 = 리스트/`EmptyState` 컴포넌트 prop
- 요청 에러 = wrapper hook onError → Toast
- 시스템 에러 = react-router `errorElement` / `ErrorBoundary`
- `{Name}Page.tsx`는 `data` 렌더 조합만

**예외**: 첫 진입 cold start가 길고 placeholder 깜빡임 우려 시 `placeholderData` 또는 Suspense + Skeleton 도입.

**관련**: `page.md`, `react.md` "React Query 컨벤션"

---

### RX-14 placeholderData + isSuccess 게이트 함정 — Major

```ts
// ❌ Before — placeholderData가 첫 렌더부터 isSuccess=true → effect가 빈 값으로 1회 소진
const optionsQuery = useQuery({ queryKey, queryFn, placeholderData: keepPreviousData });
useEffect(() => {
  if (!optionsQuery.isSuccess) return;            // placeholderData면 첫 렌더부터 true
  setValue("target", optionsQuery.data[0]?.value); // data는 아직 placeholder → undefined 주입
}, [optionsQuery.isSuccess]);                      // 실데이터 도착 시 true→true(변화 없음) → 재실행 X
```

```ts
// ✅ After — 실데이터 도착 신호인 length로 게이트
const options = optionsQuery.data ?? EMPTY_OPTIONS;
useEffect(() => {
  if (options.length === 0) return;               // 실데이터 도착 후에만
  setValue("target", options[0].value, { shouldValidate: true });
}, [options.length]);
```

**WHY**: `placeholderData`를 쓰면 `isSuccess`/`status`가 **첫 렌더부터 success**가 된다. 기본값 주입 effect의 게이트를 `isSuccess`로 두면 placeholder(빈 값)로 effect가 1회 소진되고, 실데이터 도착 시 `isSuccess`는 이미 `true→true`(deps 변화 없음)라 effect가 **재실행되지 않아** 기본값이 끝내 주입되지 않는다. 게이트는 실데이터의 신호인 데이터 `length`로.

**판단**: `onSuccess` 콜백이 없는(React Query v5) 환경에서 "데이터 로드 후 1회 기본값 주입"이 필요하면 게이트를 `data.length`로. `reset`(폼 전체 리셋)이 아니라 필드별 `setValue`로 주입.

**관련**: `RX-12`, `react.md` "React Query 컨벤션"

---

### RX-15 ref를 Context value에 담기 / effect에서 setState 리셋 — Major (React19)

```tsx
// ❌ Before — sentinel/scroll ref를 페이지 Context value에 실음 → 소비처 result.* 전부 react-hooks/refs 플래그
const result = { data, sentinelRef, /* ... */ };
// HomePage: {result.hasBooks && ...}  ← "Cannot access refs during render"

// ❌ effect에서 setState로 리셋 → react-hooks/set-state-in-effect
useEffect(() => { if (detailTarget) setDraft(""); }, [detailTarget]);
```

```tsx
// ✅ After — ref는 dedicated 훅이 소유·반환, Context엔 안 실음
const { scrollRef } = useVirtualScroll({ count, hasNextPage, onLoadMore });
<div ref={scrollRef} />

// ✅ 리셋은 effect 말고 — (a) key 교체(전체 리셋) 또는 (b) 이전 값 useState 비교(일부 state 동기화)
// (a) 예: <BookResultList key={`${filters.q}|${filters.target}`} />  (virtualizer 재생성)
// (b) 예: useSearchInput이 URL 검색어 변경 시 입력 버퍼 동기화 (ref 아님 — react-hooks/refs 회피)
const [prev, setPrev] = useState(initialValue);
if (prev !== initialValue) { setPrev(initialValue); setDraft(initialValue); }
```

**WHY**: (1) React19 `react-hooks/refs`는 render 중 ref 접근을 막는데, ref가 Context value 객체 안에 있으면 그 객체의 **모든 프로퍼티 접근**이 render-time ref 접근으로 플래그된다 — ref는 그것을 쓰는 dedicated 훅이 소유하고 JSX `ref={}`로만 부착. (2) `react-hooks/set-state-in-effect`는 effect 내 `setState`를, `react-hooks/refs`는 렌더 중 ref 접근을 막는다 — "prop 바뀌면 리셋"은 `key` 교체(전체) 또는 이전 값을 **`useState`로**(ref ❌) 들고 렌더 중 비교해 조정(일부).

**관련**: `react.md` "ref는 dedicated 훅이 소유", `RX-11`(cleanup)

---

## CH — 응집도 (출처: FF 응집도)

### CH-1 매직 넘버 — 함께 변해야 할 값이 분리 — Major

```ts
// ❌ Before — debounce 시간 500이 여러 곳에 흩어져, 한쪽만 바뀌면 동작 불일치
const debouncedQuery = useDebounce(filters.query, 500);
// 다른 파일: setTimeout(..., 500)
```

```ts
// ✅ After — 상수로 묶기 (값 + 의도)
const SEARCH_DEBOUNCE_MS = 500;
const debouncedQuery = useDebounce(filters.query, SEARCH_DEBOUNCE_MS);
```

**WHY**: 가독성 관점은 "500이 뭐냐" 해소, **응집도 관점**은 "값이 바뀔 때 함께 바뀌어야 할 다른 코드가 자동 추적되게" — 상수 한 곳만 수정하면 됨.

**관련**: `conventions.md` "매직 넘버 상수화", FF 응집도/`magic-number-cohesion`

---

## CP — 결합도 (출처: FF 결합도)

### CP-1 미묘한 차이가 있는데 공통화 — Major

```ts
// ❌ Before — 모든 화면에서 똑같이 동작한다고 가정한 공통 hook
export const useOpenBookModal = () => {
  return (book: Book) => {
    logging.log("book_modal_opened", { page: "common" });  // 로깅 라벨 고정
    openModal(<BookDetail book={book} />);
    scrollToTop();   // 모든 화면에서 스크롤 이동
  };
};
```

```ts
// ✅ After — 각 화면이 자신의 요구사항대로 인라인 구현 (중복 허용)
// 검색 페이지
const openDetail = (book: Book) => {
  logging.log("book_modal_opened", { page: "search" });
  openModal(<BookDetail book={book} />);
};
// 찜 페이지 — 스크롤 이동 없음, 라벨 다름
const openDetail = (book: Book) => {
  logging.log("book_modal_opened", { page: "favorites" });
  openModal(<BookDetail book={book} />);
};
```

**WHY**: 공통화는 화면마다 **완전히 같은 동작**이 보장될 때만. 화면별 미묘한 차이(로깅 라벨/스크롤 여부/후속 동작)가 발생할 가능성이 있으면 공통화가 미래 수정 비용 ↑(공통 함수에 화면별 분기 if 누적).

**판단 기준** (`conventions.md` "중복 코드 공통화 판단" 강화):
- ✅ **공통화 OK**: 모든 호출처가 100% 같은 동작 + 변할 여지 없음
- ✅ **중복 허용 OK**: 호출처별로 로깅/후속 동작이 다를 가능성 있음 — 결합도 낮춤

**관련**: `conventions.md` 결합도, `karpathy-principles.md` 원칙 2 "3곳 미만 인라인", FF 결합도/`use-bottom-sheet`

---

## 카탈로그 운영 정책

### 추가 기준

- **새 안티패턴 발견** (코드 리뷰/사용자 피드백/작업 중) → 본 카탈로그에 추가
- 메모리에 저장된 패턴이 **재발 가능성 있으면** 카탈로그로 승격
- 1회성 실수는 메모리만, 구조적 패턴은 카탈로그

### 제거 기준

- 룰 자체가 폐기되어 더 이상 위반이 의미 없을 때
- 자동 lint/typescript로 100% 차단 가능해진 경우

## 참고 자료

- 코드 품질 원칙(가독성/예측가능성/응집도/결합도): https://frontend-fundamentals.com/ (`conventions.md`에서 인용)
- 관련 룰: `karpathy-principles.md`, `conventions.md`, `react.md`, `page.md`
