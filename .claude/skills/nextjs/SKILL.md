---
name: nextjs
description: Next.js App Router 아키텍처 가이드. Route Group, Server/Client Component 경계, "use client" 최소화, API Route vertical slice(route.ts 얇게 → service.ts → zod → 응답 봉투), 캐싱/revalidate 패턴을 제공합니다. 트리거 - 페이지/라우팅/API Route 관련 작업
effort: medium
paths:
  - "app/**/page.tsx"
  - "app/**/layout.tsx"
  - "app/api/**/route.ts"
  - "app/api/**/service.ts"
  - "next.config.{js,ts,mjs}"
---

# /nextjs — Next.js 아키텍처 가이드

Next.js App Router 기반 **단독 앱**의 라우팅, 서버/클라이언트 컴포넌트 경계, API Route 구조를 정의하는 스킬. 카카오 도서 검색 REST API를 서버 프록시로 감싸는 것이 핵심 데이터 경로다.

> 인증/DB가 없는 과제다. 미들웨어 인증, 로그인 게이트, 세션 레이어는 존재하지 않는다.
> (참고: Next 최신 버전은 `middleware.ts` 파일명이 `proxy.ts`로 변경되었으나, 본 앱은 미들웨어 자체가 불필요.)

## 프로젝트 구조

```
app/
├── layout.tsx            # 루트 레이아웃 (Providers: React Query, nuqs 등)
├── page.tsx              # 도서 검색 화면
├── favorites/
│   └── page.tsx          # 찜 목록 화면
└── api/
    └── books/
        ├── route.ts      # 얇은 핸들러 (검증 → service 호출 → 응답 봉투)
        └── service.ts    # 카카오 upstream 호출 + DTO 매핑
components/               # 자체 UI 컴포넌트 (tv() 슬롯 + @theme 토큰)
lib/
├── http/
│   ├── response.ts       # ok() / fail() 응답 봉투 헬퍼
│   └── kakao.ts          # 카카오 axios 인스턴스 (서버 전용, KAKAO_REST_API_KEY)
└── schemas/              # zod 스키마 (검색 파라미터, 응답 DTO)
```

> 페이지가 2~3개인 소규모 앱이다. Route Group `(group)`은 공통 레이아웃이 실제로 갈릴 때만 도입하고, 지금 규모에서는 flat 구조로 충분하다 — 과 엔지니어링 금지.

## Server Component vs Client Component

### Server Component (기본)

```typescript
// layout.tsx, 초기 데이터 프리페칭 컴포넌트
// 환경변수 접근, 서버 fetch 가능. 번들에 포함되지 않음.
const Page = async () => {
  const data = await fetchInitial(); // 서버에서 직접 호출
  return <ClientView initialData={data} />;
};
```

### Client Component ('use client')

```typescript
"use client";
// 상태 관리, 이벤트 핸들러, 브라우저 API
// React Query, RHF+zod 폼, nuqs URL 상태, 찜 localStorage 접근
```

**판단 기준:**

| 조건                                          | 경계     |
| --------------------------------------------- | -------- |
| useState/useEffect 필요                       | Client   |
| onClick/onChange/입력 핸들러 필요             | Client   |
| React Query useQuery / nuqs useQueryState     | Client   |
| localStorage(찜 목록) 접근                    | Client   |
| 환경변수(서버 전용 키) 접근                   | Server   |
| SEO 메타데이터(`generateMetadata`)            | Server   |

**"use client" 최소화 원칙:**

- `"use client"`는 **인터랙션이 실제로 필요한 리프 컴포넌트**에만 붙인다.
- 페이지 전체를 클라이언트로 만들지 말 것 — Server Component가 프레임을 그리고, 인터랙티브 조각만 Client로 분리.
- 검색 결과 리스트에서 카드 프레임은 Server, "찜 토글" 버튼만 Client로 쪼개는 식.

## API Route — vertical slice 패턴

route.ts는 **얇게**. HTTP 경계(파싱·검증·응답 봉투)만 담당하고, upstream 호출과 매핑 로직은 `service.ts`로 내린다.

### 1. 응답 봉투 헬퍼 (`lib/http/response.ts`)

```typescript
import { NextResponse } from "next/server";

export const ok = <T>(data: T) => NextResponse.json({ ok: true, data });

export const fail = (code: string, message: string, status = 400) =>
  NextResponse.json({ ok: false, error: { code, message } }, { status });
```

### 2. route.ts (얇은 핸들러)

```typescript
// app/api/books/route.ts
import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/http/response";
import { searchQuerySchema } from "@/lib/schemas/book";
import { searchBooks } from "./service";

export const GET = async (request: NextRequest) => {
  // 1. 입력 검증 (zod safeParse) — searchParams → 스키마
  const params = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = searchQuerySchema.safeParse(params);
  if (!parsed.success) return fail("VALIDATION_ERROR", "검색 파라미터가 올바르지 않습니다.");

  // 2. 비즈니스 로직은 service로 위임
  try {
    const result = await searchBooks(parsed.data);
    return ok(result); // 3. 응답 봉투
  } catch {
    // upstream(카카오) 원문/키를 노출하지 않는다 — 자체 메시지로 치환
    return fail("UPSTREAM_ERROR", "도서 검색에 실패했습니다.", 502);
  }
};
```

### 3. service.ts (로직 + DTO 매핑)

```typescript
// app/api/books/service.ts
import { kakao } from "@/lib/http/kakao"; // 서버 전용 axios 인스턴스
import { toBookList } from "@/lib/schemas/book";
import type { SearchParams } from "@/lib/schemas/book";

export const searchBooks = async (params: SearchParams) => {
  const res = await kakao.get("/v3/search/book", { params });
  return toBookList(res.data); // 카카오 응답 → 앱 도메인 DTO로 매핑
};
```

**핵심 규칙:**

- 카카오 REST 키(`KAKAO_REST_API_KEY`)는 `lib/http/kakao.ts`(서버 전용)에서만 주입한다. Route Handler 밖(클라이언트)에서 접근 금지.
- 클라이언트는 자체 `/api/books`만 호출하고, 카카오 도메인을 직접 부르지 않는다.
- 카카오 응답을 그대로 흘리지 말고 필요한 필드만 DTO로 매핑해 응답 봉투에 담는다 (불필요 헤더/원문 미노출).

## 캐싱 / revalidate

카카오 검색은 동적 쿼리라 기본적으로 매 요청 처리한다. 필요 시 응답 캐시로 부하를 줄인다.

```typescript
// Route Segment Config (app/api/books/route.ts)
export const dynamic = "force-dynamic"; // 검색은 매 요청 신선하게 (기본값에 가까움)
// 또는 짧은 캐시가 허용되면:
// export const revalidate = 60;         // 60초 ISR 캐시
```

- **검색 결과**: 사용자 입력에 따라 매번 달라지므로 캐시 이점이 작다. 굳이 캐시하지 않아도 무방.
- **찜 목록**: 서버 상태가 아니라 **클라이언트 localStorage**에 저장한다 (인증/DB 없음). API Route 대상이 아님.
- fetch 단위 캐시가 필요하면 `fetch(url, { next: { revalidate: N } })`를 사용하되, 도서 검색 특성상 신선도가 우선이다.

## 페이지 추가 패턴

```
app/{new-route}/
├── page.tsx          # 조합 + 렌더링 (얇게)
├── page.style.ts     # tv() 레이아웃 (선택)
└── hooks/
    └── use{Name}.ts  # 비즈니스 로직 (React Query / nuqs 등)
```

- 페이지 컴포넌트는 조합에 집중하고, 데이터 로직은 `hooks/`로 분리.
- 검색 상태(query, page)는 nuqs로 URL에 동기화하여 공유·새로고침에 견고하게.

## 주의사항

- 카카오 키는 서버 전용 env(`KAKAO_REST_API_KEY`)로만 사용. `NEXT_PUBLIC_` 접두사 절대 금지 (클라이언트 번들 노출).
- `"use client"` 컴포넌트에서 서버 전용 모듈(`lib/http/kakao.ts` 등) 직접 import 금지 → `/api/books`(Route Handler) 경유.
- Server Component에서 `redirect()`는 try/catch 안에서 호출 금지 (Next.js가 throw로 구현).
- route.ts는 얇게 유지. 조건 분기·매핑·upstream 호출이 늘면 `service.ts`로 내린다.
- 에러 응답에 upstream(카카오) 원문/스택/키를 담지 않는다 — 자체 코드·메시지로 치환.
