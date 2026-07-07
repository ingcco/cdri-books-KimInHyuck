# CDRI Books — 카카오 도서 검색 (사전과제)

항상 한국어로 응답한다. 코드 주석도 한국어.

## 프로젝트 개요

카카오 다음 책 검색 REST API 기반 도서 검색 + 찜 서비스. Next.js **단독 앱**(모노레포 아님).
- 페이지: 도서 검색(`/`), 찜 목록(`/favorites`) — 소규모이지만 설계 완성도로 승부
- 평가 기준: ① 재사용 컴포넌트 설계 ② 가독성·유지보수성 ③ 상태 관리·API 연동 ④ 성능 최적화
- 모든 기술 선택에는 근거가 있어야 하며, README의 "라이브러리 선택 이유"에 기록한다

## 기술 스택 (확정 — 변경 시 사용자 승인 필수)

| 선택 | 근거 |
|---|---|
| Next.js (App Router) | 카카오 REST 키를 Route Handler 프록시로 서버에 은닉(선택 이유 1순위) + SSR/메타데이터로 SEO |
| TypeScript strict + `noUncheckedIndexedAccess` | 런타임 오류 컴파일 타임 차단 |
| @tanstack/react-query v5 | 과제 필수 스택. 서버 상태 SOT |
| nuqs | 검색어·필터를 URL에 보존 → 공유 가능한 검색 결과, 새로고침 유지 |
| Tailwind CSS v4 + tailwind-variants | 자체 `@theme` 토큰으로 Figma 디자인 토큰화, tv() 슬롯으로 스타일 co-locate, 런타임 비용 0 |
| react-hook-form + zod | 폼·검증 SOT 공유 (서버 validation 스키마 재사용) |
| axios | 인터셉터로 응답 봉투 정규화 |
| 자체 UI 컴포넌트 | 평가 기준 1번(재사용 컴포넌트 설계) 직접 어필 — 외부 UI 킷 미사용 |
| Vitest + MSW / Playwright | unit·integration(Route Handler 직접 호출, 카카오 API는 MSW 스텁) / e2e |
| pnpm, Vercel | 단일 패키지, 배포 후 URL 제출 |

전역 상태 라이브러리(Redux/Zustand) 미사용 — 서버 상태는 RQ, URL 상태는 nuqs, 찜은 localStorage, 나머지는 useState/Context로 충분. 이 판단 자체가 근거다.

## 보안 불변식 (위반 = 즉시 중단)

- 카카오 REST 키는 `KAKAO_REST_API_KEY`(서버 전용 env)로만 사용. **`NEXT_PUBLIC_` 접두사 절대 금지**
- 키 사용 위치는 `app/api/**` Route Handler 내부뿐. 클라이언트는 자체 API만 호출
- `.env*`는 `.gitignore` 필수 (제출 시 이메일로 별도 공유)

## 작업 루프

1. `/planning` → `.docs/plans/{날짜}-{주제}.md` + `.backlog.md` 짝파일 생성, 사용자 합의 후 구현
2. 구현은 메인 세션 직접 수행 (에이전트 팀 불필요 규모). 리뷰 객관성 필요 시 `reviewer` 에이전트만 spawn
3. `/review` (필요시 `/security`, `/review-ui`) → `/ship` (검증→커밋→세션 리포트)
4. 개인 과제 레포 — main 직접 작업 허용
5. **과정 문서화**: 각 단계 산출물(.docs/, 세션 리포트, 커밋 히스토리)이 "Claude를 어떻게 통제하며 썼는지"의 증거가 된다. 하네스 셋팅 과정 자체는 과정 문서에서 제외

## 프로젝트 구조 규약

- 페이지 수직 슬라이스: `page.tsx`(얇은 조립) + `hooks/useXxx.ts`(페이지 상태 전부) + `components/`(Context 소비만) + `styles/*.style.ts`(tv 슬롯) — 상세: `.claude/rules/page.md`
- 데이터 3계층: `lib/api/client/http.ts` → `lib/api/{books,favorites}/api.ts` → `api.queries.ts`, queryKey는 `lib/api/shared/queryKeys.ts` 팩토리 집중
- API Route 슬라이스: `route.ts`(얇게) + `service.ts`(로직) + zod validation + 응답 봉투 `ok()`/`fail()`

## 테스트 정책

- unit: 순수 함수·훅 (Vitest)
- integration: Route Handler 함수 직접 import 호출, 카카오 upstream은 MSW 스텁
- e2e: Playwright — 검색→결과→찜→찜 목록 핵심 여정
- 커밋 전 `pnpm lint && pnpm check-types && pnpm test:unit` 통과 필수

## 행동 원칙

- `.claude/rules/karpathy-principles.md` — Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven
- `.claude/rules/ai-defense.md` — 할루시네이션·컨텍스트 드리프트 방어
- 과 엔지니어링 금지: 요청 범위 초과 구현·불필요한 추상화는 하지 않는다
