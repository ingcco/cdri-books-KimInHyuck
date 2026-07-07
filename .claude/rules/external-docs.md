---
description: "외부 공식 문서 fetch 시 권위 도메인 가이드. WebFetch 실패 시 fallback 순서. AI 어시스턴트가 도메인을 혼동해 403/401 반복하는 실수 방지."
paths:
  - ".docs/plans/**"
  - ".claude/**"
---

# 외부 공식 문서 — 권위 도메인 가이드

라이브러리/API/벤더 공식 문서를 fetch할 때 **올바른 도메인**을 첫 시도에 사용해 403/401 반복을 방지한다.

## 배경 (왜 이 룰이 필요한가)

AI 어시스턴트는 학습 데이터 시점의 도메인을 추측해 fetch하는 경향이 있다. 벤더가 도메인을 옮긴 경우 기존 도메인에서 403/401이 반복 발생하고, fallback 없이 시간만 소모된다. 이 룰은 **벤더별 권위 도메인을 고정**하고, 실패 시 fallback 순서를 명시한다.

## 권위 도메인 표

| 벤더                | 정답 도메인                                          | 흔한 오답 (피하기)                            |
| ------------------- | ---------------------------------------------------- | --------------------------------------------- |
| **카카오 (Kakao)**  | `developers.kakao.com/docs/latest/ko/...` (도서 검색 REST API) | 구 `developers.kakao.com/docs/restapi/...` (레거시 경로) |
| **Vite**            | `vite.dev/guide/...`                                 | `vitejs.dev/...` (구 도메인, 리다이렉트)      |
| **react-router**    | `reactrouter.com/...` (v7)                           | `reactrouter.com/en/6...` (구버전 경로)       |
| **React**           | `react.dev/...`                                      | `reactjs.org/docs/...` (구버전)               |
| **Tailwind CSS**    | `tailwindcss.com/docs/...`                           | -                                             |
| **TanStack Query**  | `tanstack.com/query/latest/docs/...`                 | `react-query.tanstack.com` (구버전)           |
| **nuqs**            | `nuqs.47ng.com/docs/...`                             | -                                             |
| **react-hook-form** | `react-hook-form.com/...`                            | -                                             |
| **Zod**             | `zod.dev/...`                                        | -                                             |
| **Vercel**          | `vercel.com/docs/...`                                | -                                             |
| **Anthropic**       | `docs.anthropic.com/...`                             | `anthropic.com/docs/...` (리다이렉트)         |

> 도메인이 표에 없으면 **WebSearch**로 권위 URL을 먼저 확보 후 WebFetch.

## 카카오 도서 검색 API 참고

- 엔드포인트: `GET https://dapi.kakao.com/v3/search/book`
- 인증: `Authorization: KakaoAK {REST_API_KEY}` 헤더
- 주요 파라미터: `query`(검색어), `sort`(`accuracy`/`latest`), `page`, `size`, `target`(`title`/`isbn`/`publisher`/`person`)
- 응답: `{ documents: Book[], meta: { total_count, pageable_count, is_end } }`
- 문서: `developers.kakao.com/docs/latest/ko/daum-search/dev-guide` (검색 REST API 개발 가이드)

## fetch 실패 fallback 순서

WebFetch가 4xx/5xx 반환 시 다음 순서로 시도:

1. **권위 도메인 표 재확인** — URL 슬러그 오타/구버전 경로 가능성
2. **WebSearch** — 권위 도메인 + 키워드로 1차 검색
3. **GitHub 이슈/문서 레포** — 라이브러리 공식 레포의 문서 또는 이슈

## 동작이 문서와 다를 때 — GitHub 이슈 트래커 (필수 추가 소스)

공식 문서는 "정상 동작"을 전제로 쓰여 **알려진 회귀/버그를 담지 않는다**. **문서대로 했는데 안 될 때**(특히 로컬은 되는데 빌드/배포에서만 깨질 때)는 권위 문서 fetch에 더해 **해당 라이브러리의 GitHub 이슈 트래커를 반드시 함께 조사**한다 — should-work-but-doesn't의 정답은 대개 문서가 아니라 이슈에 있다.

| 라이브러리 | 이슈 트래커 |
|---|---|
| Vite | `github.com/vitejs/vite/issues` |
| react-router | `github.com/remix-run/react-router/issues` |
| TanStack Query | `github.com/TanStack/query/issues` |
| nuqs | `github.com/47ng/nuqs/issues` |
| react-hook-form | `github.com/react-hook-form/react-hook-form/issues` |
| 그 외 | `github.com/{org}/{repo}/issues` (npm 패키지 repository 필드에서 확인) |

**검색**: WebSearch에 **증상 키워드 + 환경 키워드**(예: `Turbopack "Cannot find module" pnpm`). GitHub 이슈 본문은 `gh issue view {n} --repo {org}/{repo}` 또는 WebFetch(429 시 WebSearch 스니펫).

**추출 항목(4종)**: ① open/closed ② affected version(우리 버전 포함 여부) ③ workaround ④ fixed version(있으면). **판정**: `open + 우리 버전 영향 + workaround 존재` → 업스트림 버그(우리 버그 아님) → workaround 적용 + **재평가 트리거**(이슈 close/fixed version 도달 시 원래 방식 재검토)를 룰·메모리에 기록.

## 권위 도메인 드리프트 케이스 스터디

벤더가 문서 도메인을 옮기면 구 도메인은 리다이렉트 없이 401/403만 반환하는 경우가 있다(예: 일부 벤더의 `platform.*` → `developers.*` 이전). **권위 도메인 표에 없는 벤더는 첫 시도 전 WebSearch로 현재 도메인을 확인**하고, 403/401이 반복되면 도메인 자체를 의심한다(경로가 아니라 호스트 문제).

## 룰 발동 조건

다음 작업 중 외부 문서 참조가 필요할 때:

- 라이브러리 신규 도입 (`/planning` 스킬 시작 시)
- 버전 마이그레이션 (v3 → v4 등)
- 미지의 API/엔드포인트 동작 확인 (카카오 도서 검색 파라미터/응답 shape 등)
- `.docs/plans/` 작성 중 결정 근거가 필요할 때

## 검증

- 본 plan의 결정 근거 URL을 사후 점검하여 모두 권위 도메인인지 확인
- `.docs/plans/` 신규 plan에 인용된 URL이 표 기준에 부합하는지 `/review`로 점검

## 관련 룰

- `.claude/rules/ai-defense.md` — 할루시네이션 방지 (Glob/Grep/Read 우선, 추측 금지)
