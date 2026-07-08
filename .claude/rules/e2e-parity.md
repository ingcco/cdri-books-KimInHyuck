---
description: "e2e 테스트 규칙 — Playwright DOM 실측 Figma 정합 게이트 + 기능 여정. mock/CORS·1920 고정·좌표 assertion 패턴"
paths:
  - "e2e/**"
  - "playwright.config.ts"
---

# e2e 규칙 — Playwright

e2e는 두 트랙이다. **기능 여정**(검색→결과→찜)과 **시각 정합**(DOM 실측 vs Figma). 둘 다 `e2e/`에 둔다.

## SOT

- **기능 AC**: `.docs/spec/requirements.md` — 각 요구사항의 `WHEN→THEN` + 레벨 태그(`u`/`i`/`e`)가 테스트 기준. `[F]/[N]/[판단]/[추가]` 분류로 "스펙 vs 지원자 추가"까지 구분.
- **시각 px**: `.docs/design/screens.md` "실측 정합 SOT"(Figma REST 실측) → `e2e/fixtures.ts`의 `SPEC`/`RGB` 상수로 박제. 값 바뀌면 fixtures만 갱신.

## config (`playwright.config.ts`)

- **뷰포트 1920×1080 고정**(반응형 미대응 — 시안 단일). `devices["Desktop Chrome"]`는 1280이므로 project에서 재정의.
- `use.contextOptions.reducedMotion: "reduce"` — framer-motion 정착 대기 최소화(단, 측정은 layout 속성이라 opacity 애니메이션엔 무관). 이 Playwright 버전은 `reducedMotion`을 top-level `use`가 아니라 `contextOptions` 안에서 받는다(top-level은 ts2769).
- **타입 커버리지**: `e2e/**`·`playwright.config.ts`는 `tsconfig.e2e.json`(lib에 DOM — `page.evaluate` 콜백의 `window`/`getComputedStyle`)에 포함돼 root references로 묶인다 → `pnpm check-types`가 e2e도 검사(커밋 게이트). tsconfig 밖에 두면 config 타입 오류를 에디터만 잡고 CI/커밋은 놓친다.
- `webServer: { command: "pnpm dev", url: ":3000", reuseExistingServer: true }`.

## 카카오 API mock (필수 패턴)

`dapi.kakao.com`은 cross-origin + axios가 `Authorization` 헤더를 실어 **CORS preflight(OPTIONS)** 가 뜬다. route fulfill 시 반드시 CORS 헤더 + OPTIONS 204를 처리한다.

```ts
await page.route((url) => url.hostname === "dapi.kakao.com", async (route) => {
  const cors = { "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "authorization,ka,content-type" };
  if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
  return route.fulfill({ status: 200, headers: { ...cors, "content-type": "application/json" },
    body: JSON.stringify({ documents, meta: { total_count, pageable_count, is_end } }) });
});
```

- **검색 트리거**: `page.goto("/?q=검색어")` — nuqs가 URL `q`를 읽어 검색 실행(debounce 없음, enabled는 `q.trim().length>0`).
- **찜 시드**: `page.addInitScript`로 `localStorage["favorites"]`에 `FavoriteBook[]` JSON 주입(찜은 API 아님). 검색기록은 `localStorage["search-history"]`.

## DOM 실측 assertion

- **크기·좌표·gap** = `locator.boundingBox()`(뷰포트 CSS px). gap = `b.x - (a.x + a.width)`, pad = `child.x - parent.x`.
- **색·폰트·border** = `getComputedStyle` — 색은 `"rgb(r, g, b)"` 포맷으로 비교(`RGB` 상수).
- **허용 오차** `near(actual, expected, tol=2)` — 서브픽셀·폰트 렌더 흡수. 1px 요소는 tol 1.5.
- 위치 잡기: 텍스트/role 우선(`getByRole`, `getByLabel`, `getByText`), 클래스 셀렉터는 `.h-\\[100px\\]`처럼 arbitrary escape. prettier가 클래스 순서를 바꾸므로 **순서 비의존**(`.a.b`)으로.

## 실행

`pnpm test:e2e`. 최초 1회 `npx playwright install chromium`. dev 서버(3000) 떠 있으면 재사용.
