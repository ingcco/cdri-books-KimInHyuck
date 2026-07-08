# CDRI Books

## 실행 방법

Node 20+, pnpm 9+

```bash
pnpm install
# .env 에 VITE_KAKAO_REST_API_KEY 설정
pnpm dev
```

## 화면

| 경로          | 화면      |
| ------------- | --------- |
| `/`           | 도서 검색 |
| `/favorites`  | 찜한 책   |
| `/error`, `*` | 에러·404  |

## 기술 스택

| 분류           | 사용                               |
| -------------- | ---------------------------------- |
| 코어           | React 19, TypeScript(strict), Vite |
| 라우팅         | react-router                       |
| 서버 상태      | React Query                        |
| URL 상태       | nuqs                               |
| 화면 상태 공유 | React Context API                  |
| 통신           | axios (카카오 API 직접 호출)       |
| 스타일         | Tailwind, tailwind-variants        |
| 애니메이션     | framer-motion                      |
| 목록 가상화    | react-virtual                      |
| 테스트         | Vitest, MSW, Playwright            |

### 선택 이유

몇 가지는 이 프로젝트에 맞아서 골랐습니다.

- **nuqs** — 검색어와 검색 조건을 URL에 담습니다. 새로고침하거나 링크를 공유해도 검색 상태가 그대로 이어집니다.
- **react-virtual** — 검색 결과가 수백 개로 늘어나도, 화면에 보이는 만큼만 실제로 그립니다. 스크롤이 무거워지지 않습니다.
- **Vitest** — Vite 설정을 그대로 써서 테스트 환경을 따로 맞출 필요가 없습니다.
- **MSW** — 목업 데이터로 카카오 API 연동을 테스트할 수 있는 환경을 만듭니다.
- **Playwright** — 검색부터 찜까지, 실제 브라우저에서 사용자 흐름을 그대로 확인합니다.

## 폴더 구조

전체는 역할별로 나뉩니다.

```
src/
├── components/   공용 UI (버튼·인풋·드롭다운·토스트) — 직접 제작
├── hooks/        여러 화면이 함께 쓰는 범용 훅
│   ├── useVirtualScroll.ts   목록 가상화 + 무한 스크롤
│   ├── useOutsideClick.ts    바깥 클릭 감지 (드롭다운·팝오버 닫기)
│   └── useCollapse.ts        아코디언 펼침·접힘
├── lib/          데이터·도메인 로직 (api, favorites, animation)
└── pages/        화면별 폴더 (home, favorites …)
```

무엇을 공통으로 둘지는 기준을 정해서 판단했습니다.

- 여러 화면이 같은 동작을 쓰는 훅(가상 스크롤 등)은 `hooks/`에 모았습니다.
- 찜 로직은 검색·찜 두 화면이 함께 써서 공유 폴더(`lib/favorites`)에 두었습니다.
- 검색 입력처럼 한 화면에서만 쓰는 로직은 그 화면 폴더 안에 두었습니다.

화면 단위로 관심사를 나눴습니다. 한 화면에서 쓰는 상태·컴포넌트·스타일을 폴더 하나에 모읍니다.

```
src/pages/home/            도서 검색 화면
├── HomePage.tsx           레이아웃을 잡고 컴포넌트를 조립
├── hooks/                 비즈니스 로직 (검색어, 검색 기록, 입력값)
├── components/            지역 컴포넌트 (home 화면 전용)
└── styles/                화면 전용 스타일 (tailwind-variants)
```

상태는 훅에 모으고 컴포넌트는 받은 값을 표시만 해서, 화면 로직이 한곳에서 관리됩니다.

데이터를 가져오는 `lib/api`도 역할별로 파일을 나눴습니다.

```
src/lib/api/books/
├── api.ts                 카카오 API 요청 함수를 정의하는 곳
├── api.queries.ts         React Query 쿼리 모음 (여러 페이지를 합치고, 화면이 쓸 값만 추림)
└── api.interface.ts       books 도메인의 요청·응답 타입
```

## 컴포넌트 설계

버튼·인풋·드롭다운·토스트 같은 공용 UI를 외부 라이브러리 없이 직접 만들었습니다. 컴포넌트마다 구조와 스타일을 파일로 나눴습니다.

```
src/components/
├── button/
│   ├── Button.tsx          컴포넌트 마크업·로직
│   └── Button.style.ts     tailwind-variants 스타일 (buttonVariants)
└── dropdown/
    ├── Dropdown.tsx
    ├── Dropdown.style.ts
    ├── components/         합성용 하위 컴포넌트 (Trigger·Content·Item)
    └── hooks/              컴포넌트 전용 훅 (useDropdown)
```

- **`{Name}.tsx` + `{Name}.style.ts` 짝** — 스타일을 파일로 나눠서, 컴포넌트는 구조에 집중하고 색·크기 변형은 스타일 파일에서 관리합니다.
- **컴포넌트는 상태를 갖지 않습니다** — 화면의 상태는 화면 훅이 갖고, 컴포넌트는 받은 값을 표시만 합니다. 그래서 같은 컴포넌트를 여러 화면에서 그대로 씁니다.
- **여러 조각으로 나뉘는 컴포넌트는 컴파운드(Compound) 패턴으로** — 드롭다운은 하위 조각(`components/`)과 전용 훅(`hooks/`)을 폴더 안에 두고, `list`만 넘기는 간단한 사용과 `Dropdown.Trigger`·`Dropdown.Content`로 직접 조립하는 방식을 함께 지원합니다.

## 테스트

| 종류 | 대상                                               | 개수 | 실행                    |
| ---- | -------------------------------------------------- | ---- | ----------------------- |
| 단위 | 순수 함수·훅                                       | 26   | `pnpm test:unit`        |
| 통합 | API 함수 + React Query 훅 (MSW로 카카오 응답 흉내) | 9    | `pnpm test:integration` |
| E2E  | 검색→찜 흐름, Figma 디자인 확인                    | 15   | `pnpm test:e2e`         |

**Lighthouse** (프로덕션 빌드, 데스크톱 기준)

| 화면                   | Performance | Accessibility | Best Practices | SEO |
| ---------------------- | ----------- | ------------- | -------------- | --- |
| 도서 검색 (`/`)        | 100         | 95            | 100            | 91  |
| 찜한 책 (`/favorites`) | 100         | 100           | 100            | 92  |

## Claude 활용

계획·리뷰·커밋을 단계로 나누고 그 과정을 문서로 남기며 작업했습니다. 코드 스타일과 자주 하는 실수는 `.claude/rules/`에 규칙으로 정리했습니다. 자세한 과정은 [PROCESS.md](./PROCESS.md)에 있습니다.
