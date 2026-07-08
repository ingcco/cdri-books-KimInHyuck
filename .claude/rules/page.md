---
description: "페이지 패턴 — Vite+React 수직 슬라이스(src/pages/{Name}Page/ = {Name}Page.tsx + hooks/ + components/ + styles/) 표준과 {name}Variants tv() 스타일 규약."
paths:
  - "src/pages/**/*Page.tsx"
  - "src/pages/**/styles/*.style.ts"
  - "src/pages/**/hooks/use*.ts"
  - "src/pages/**/components/**/*.tsx"
---

# 페이지 패턴 — 수직 슬라이스 (Vite + React)

라우트 하나를 **수직 슬라이스**로 구성한다(`src/pages/{Name}Page/`). 한 라우트에 필요한 상태·뷰·스타일이 그 폴더 안에서 완결된다. 라우트 등록은 react-router v7(`/` → SearchPage, `/favorites` → FavoritesPage).

## 파일별 역할

| 파일                     | 역할                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| `{Name}Page.tsx`         | **얇은 조립** — Context.Provider + 컴포넌트 배치. 비즈니스 로직 없음 |
| `hooks/use{Name}.ts`     | **페이지 상태 전부** — query/filter/form/handler 보유 + Context value 생성 |
| `components/*.tsx`       | **Context 소비만** — 자체 데이터 훅(useQuery 등) 호출 금지            |
| `styles/{name}.style.ts` | **tv 슬롯** — 구조적 레이아웃 (wrapper/container/header/content/footer) |

## 예시 트리

```
src/pages/SearchPage/
├── SearchPage.tsx              ← SearchContext.Provider + <SearchScreen />
├── hooks/
│   └── useSearch.ts            ← nuqs 필터 + useBookListInfiniteQuery + searchHandler + Context
├── components/
│   ├── SearchBar.tsx           ← useSearchContext() 소비
│   ├── BookList.tsx            ← useSearchContext() 소비
│   └── BookCard.tsx
└── styles/
    ├── SearchPage.style.ts      ← searchPageVariants
    └── BookCard.style.ts        ← bookCardVariants
```

데이터 계층(라우트 밖, 공유):

```
src/lib/api/index.ts               ← axios 인스턴스 (dapi.kakao.com baseURL + KakaoAK Authorization 헤더) + validateStatus로 성공(2xx) 판정
src/lib/api/books/api.ts           ← getBookList() 등 순수 요청 함수 (카카오 { documents, meta } 그대로 반환)
src/lib/api/books/api.queries.ts   ← useBookListInfiniteQuery 등 wrapper hook
src/lib/api/books/api.interface.ts ← 이 도메인 요청/응답 타입
src/lib/api/shared/{request,response}.ts ← 공유 요청/응답 타입
src/lib/api/shared/queryKeys.ts    ← bookKeys 팩토리
```

## 페이지 스타일 — `tv()` 규약

| 파일              | 역할                 | 예시                                             |
| ----------------- | -------------------- | ------------------------------------------------ |
| `hooks/useXxx.ts` | 비즈니스 로직        | filter, query, handler, state                    |
| `styles/{Name}.style.ts` | 구조적 레이아웃 (tv) | wrapper, container, header, content, footer      |
| `{Name}Page.tsx`  | 조합                 | 컴포넌트 배치, 인라인 세부 스타일               |

규칙:

- 페이지 스타일 파일은 **`{Name}.style.ts`**(예: `HomePage.style.ts`), export는 컴포넌트와 동일하게 **`{name}Variants`**(예: `homePageVariants`) — 페이지도 컴포넌트와 같은 네이밍 체계(`pageVariants` 단일명 통일 폐기, 파일명이 구분, 2026-07-08 변경)
- slots에는 **구조적 레이아웃만** (wrapper, container, header, content, footer)
- 세부 디자인 요소(`<h1>`, `<p>`, 폼 필드 스타일)는 `{Name}Page.tsx`에서 인라인
- `const styles = homePageVariants()`는 컴포넌트 외부에서 호출 (참조 안정성)
- 색상·간격·radius 등은 **`@theme` 시맨틱 토큰**만 사용 (raw Tailwind 색상 금지 — 아래 참조)

```typescript
// styles/HomePage.style.ts — 내부 스크롤 앱셸 페이지 예시
import { tv } from "tailwind-variants";

export const homePageVariants = tv({
  slots: {
    container: "mx-auto flex size-full min-h-0 max-w-[960px] flex-col gap-6 px-4 py-20",
    title: "title2 text-text-primary",
    result: "flex min-h-0 flex-1 flex-col gap-4",
    scrollArea: "min-h-0 flex-1 overflow-y-auto", // 가상 스크롤 컨테이너 (아래 "가상화·앱셸" 참조)
  },
});

export type HomePageVariants = typeof homePageVariants;
```

### 컴포넌트 스타일 분리 (`styles/` 폴더)

컴포넌트의 인라인 `tv`가 비대해져 `.tsx` 가독성을 해치면 `{route}/styles/{Component}.style.ts`로 분리한다(강제 아님).

규칙:

- export명: 컴포넌트·페이지 모두 `{name}Variants`(camelCase, 예: `bookCardVariants`, `homePageVariants`) — 파일명 `{Name}.style.ts`가 구분
- **분리 기준**: 인라인 tv가 시각적으로 컴포넌트/page 가독성을 해칠 때만 — 단순 컴포넌트는 인라인 유지(최소 추상화)
- 한 컴포넌트 내 지역 하위 컴포넌트 variants도 같은 `{Component}.style.ts`에 모은다

---

## Raw HTML 지양 — 자체 UI 컴포넌트 사용

폼 컨트롤·인터랙티브 요소는 raw HTML 대신 `components/`의 자체 컴포넌트를 사용한다. 시각 일관성 + a11y 기본기(focus ring, aria)를 컴포넌트가 보장한다. 배럴(`index.ts`) 없이 컴포넌트 파일을 직접 import(`conventions.md` "공용 컴포넌트 export" 참조).

| 지양 패턴                    | 대체 컴포넌트          | import                              |
| ---------------------------- | ---------------------- | ------------------------------------ |
| `<button>`                   | `Button`               | `@/components/button/Button`         |
| `<input>` (검색/텍스트)      | `Input`                | `@/components/input/Input`           |
| `<select>`, `<option>`       | `Dropdown`             | `@/components/dropdown/Dropdown`(flat props 또는 `Dropdown.Trigger`/`.Content`/`.Item` compound, 둘 다 지원) |
| `<input type="checkbox">`    | `Checkbox`             | `@/components/checkbox/Checkbox`     |
| 커스텀 모달                  | `Modal` (자체 Compound)| `@/components/modal/Modal`           |

**예외 (허용)**:
- `<label htmlFor>` + 커스텀 폼 필드(textarea 등 자체 컴포넌트 미지원) 페어링은 WCAG 3.3.2 a11y 의무로 허용
- 도서 카드의 대표 링크 등 시맨틱 `<a>`, 리스트 `<ul>`/`<li>`는 raw 사용이 오히려 올바름

> 무지성 일괄 교체 금지 — 컨벤션 위반을 발견하면 즉시 고치지 말고 `karpathy-principles.md` Surgical Changes에 따라 발견사항으로 보고 후 범위를 판단한다.

---

## 자체 컴포넌트 스타일 오버라이드 규칙

기본형 컴포넌트를 만들고 variant는 무한정 선제적으로 추가하지 않는다. 화면에 필요한 스킨은 **`className` 오버라이드**(또는 Search/Popover처럼 감싸는 전용 컴포넌트의 자체 style 파일)로 우선 해결한다.

- **즉흥적 우회는 금지, 이름 있는 컴포넌트의 소유는 허용**
  - 금지: 페이지/도메인 코드 아무 곳에서나 `<Input className="rounded-full ...">` 처럼 즉흥적으로 스킨을 박아넣는 것
  - 허용: `Search`(`components/input/search/`)처럼 이름 있는 합성 컴포넌트가 자기 `{Component}.style.ts`에서 `className`으로 베이스 컴포넌트에 스킨을 입히는 것 — 이 경우 스킨의 SOT가 그 컴포넌트 하나로 응집되므로 우회가 아니라 정당한 합성
- **variant 승격은 자동이 아니라 상의 후 결정** — 같은 오버라이드 패턴이 반복되면(기준: `conventions.md` "자체 컴포넌트·유틸 우선 사용 3회 룰"과 동일하게 3곳 이상) 그때 사용자와 상의해 formal variant로 승격할지 판단한다. "없으면 무조건 variant 추가"가 아님
- **시맨틱 색상 토큰 전용** — raw Tailwind 색상(`bg-blue-100`, `text-blue-600` 등) 사용 금지
  - `@theme` 시맨틱 토큰만 사용: `primary`, `foreground`, `muted`, `destructive` 등
  - 해당 토큰이 없으면 → `@theme`에 추가

## 기본 사이즈 원칙

- 같은 행의 Input/Dropdown/Button은 **반드시 동일 size** — 혼재 금지
- 컴포넌트에 size 시스템(sm/md/lg)을 두면 화면 기본은 하나로 통일하고, 인라인 액션(카드 내 아이콘 버튼 등)만 작은 size 허용

## 컴포넌트 분할·배치 기준

### 분할 — "이름값을 하는가" (4신호)

컴포넌트로 뺄지 인라인할지는 아래 4신호 중 **1개 이상** 충족 여부로 판단한다. 없으면 인라인(파일로 빼면 읽는 사람이 정의로 점프 = 시점 이동 비용 > DRY, `anti-patterns.md` CS-5).

1. **재사용** — *지금* 2곳 이상에서 실제 사용 (곧 쓸 것 같음 ❌ = YAGNI)
2. **자체 상태·행위·계약** — state/effect/ref/handler 소유 또는 a11y 계약(`aria-*`)·이벤트 API 캡슐화
3. **독립 분기 렌더** — 형제와 *다른 조건*에서만 렌더 (`anti-patterns.md` RX-4)
4. **부모 가독성 붕괴** — JSX가 커서 인라인하면 부모가 안 읽히는 응집 단위

> **파일 분리 ≠ 컴포넌트 분리**: 한 파일 안에서 2번 쓰이는 조각은 별 파일이 아니라 **같은 파일 지역 컴포넌트**로 둔다(예: `BookListItem` 안의 `BookThumbnail`/`BuyLink`/`LikeButton`).

### 배치 — 공유는 props / 페이지지역은 context 조회

| 위치 | 데이터 주입 |
| --- | --- |
| `src/components/` (2곳+ 라우트 공유) | **props** — 특정 페이지 Context를 가정하지 않음 |
| `src/pages/{Name}Page/components/` (단일 라우트) | **`use{Name}Context()` 직접 조회** — props 최소화 |

- 페이지 지역 컴포넌트는 `book` 같은 map 항목만 prop으로 받고 나머지(핸들러·파생상태)는 Context에서 조회한다.
- **지역 → 공유 승격 시 반드시 props로 되돌린다**: 공유 컴포넌트가 특정 페이지 Context에 의존하면 다른 라우트에서 못 쓴다(예: `BookListItem`을 찜 페이지와 공유하려면 `useHomeContext` 소비를 props로 환원).

## 파일 구조 규약

- `src/components/` (루트) = **2곳 이상의 라우트에서 import되는** 공유 컴포넌트만. `ui`/`layout` 같은 중간 서브폴더 없이 `src/components/{name}/`로 바로 둔다(불필요한 폴더 뎁스 금지, 2026-07-08)
- 단일 라우트에서만 쓰는 컴포넌트 → 해당 페이지 슬라이스의 `components/` 하위
- 페이지는 항상 **폴더 슬라이스 구조** (`src/pages/SearchPage/SearchPage.tsx`), 라우트 등록은 react-router
- 자체 컴포넌트를 불필요하게 래핑하는 중간 레이어 생성 금지

---

## 렌더 검증 (자체 UI 컴포넌트 수정 후)

컴포넌트 수정/추가 후 실제 사용되는 페이지에서 검증한다.

### 참조 안정성 체크

```typescript
// ❌ 매 렌더마다 새 배열/객체 생성 → 무한 루프 위험
<BookList books={data.documents.slice(0, 10)} />

// ✅ 컴포넌트 외부 상수 또는 useMemo
const topBooks = useMemo(() => data.documents.slice(0, 10), [data.documents]);
<BookList books={topBooks} />
```

### 렌더 루프 셀프 체크

1. `useEffect`/`useMemo`/`useCallback`의 deps가 **참조 안정적**인지
2. state setter가 렌더 경로에서 **무조건 호출**되지 않는지
3. 페이지가 **무한 리렌더링 없이** 정상 렌더되는지

### 검증 절차

1. **타입 체크**: `pnpm typecheck` (또는 `tsc --noEmit`)
2. **린트**: `pnpm lint`
3. **브라우저 확인**: `pnpm dev` → `http://localhost:3000/`(검색)·`/favorites`(찜) 등 컴포넌트 사용 페이지
4. **렌더 루프 확인**: 브라우저 콘솔에 반복 로그, CPU 급등, 페이지 멈춤 없는지
5. **상호작용 확인**: 검색 입력, 찜 토글, 페이지 이동 등 주요 인터랙션 정상 동작
