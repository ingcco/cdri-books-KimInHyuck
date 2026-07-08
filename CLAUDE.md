# CDRI Books — 카카오 도서 검색 (사전과제)

항상 한국어로 응답한다. 코드 주석도 한국어.

## 프로젝트 개요

카카오 다음 책 검색 REST API 기반 도서 검색 + 찜 서비스. Vite + React CSR **단독 앱**(모노레포 아님).
- 페이지: 도서 검색(`/`), 찜 목록(`/favorites`) — react-router v8 클라이언트 라우팅. 소규모이지만 설계 완성도로 승부
- 평가 기준: ① 재사용 컴포넌트 설계 ② 가독성·유지보수성 ③ 상태 관리·API 연동 ④ 성능 최적화
- 모든 기술 선택에는 근거가 있어야 하며, README의 "라이브러리 선택 이유"에 기록한다

## 기술 스택 (확정 — 변경 시 사용자 승인 필수)

| 선택 | 근거 |
|---|---|
| Vite + React CSR | 과제 필수 스택이 **"React.js" 리터럴** 준수 + 과제가 `.env`를 이메일로 제출받는 방식 → 클라이언트 키 노출을 전제로 한 순수 CSR. 빠른 dev/빌드 |
| react-router v8 | `/`(검색)·`/favorites`(찜) 클라이언트 라우팅. SPA 라우트 전환. (v7→v8은 non-breaking upgrade, v6은 EOL이라 v8 채택 — nuqs도 `nuqs/adapters/react-router/v8` 지원) |
| TypeScript strict + `noUncheckedIndexedAccess` | 런타임 오류 컴파일 타임 차단 |
| @tanstack/react-query v5 | 과제 필수 스택. 서버 상태 SOT |
| nuqs (react-router 어댑터) | 검색어·필터를 URL에 보존 → 공유 가능한 검색 결과, 새로고침 유지 |
| Tailwind CSS v4 + tailwind-variants | `@tailwindcss/vite` 플러그인 + 자체 `@theme` 토큰으로 Figma 디자인 토큰화, tv() 슬롯으로 스타일 co-locate, 런타임 비용 0 |
| axios | `dapi.kakao.com` 직접 호출 인스턴스 + 인터셉터로 에러 정규화 |
| 자체 UI 컴포넌트 | 평가 기준 1번(재사용 컴포넌트 설계) 직접 어필 — 외부 UI 킷 미사용 |
| Vitest + MSW / Playwright | unit·integration(API 계층 함수+훅을 `dapi.kakao.com` MSW 스텁으로 검증) / e2e |
| pnpm, Vercel | 단일 패키지, 배포 후 URL 제출 |

전역 상태 라이브러리(Redux/Zustand) 미사용 — 서버 상태는 RQ, URL 상태는 nuqs, 찜은 localStorage, 나머지는 useState/Context로 충분. 이 판단 자체가 근거다.

## 보안 불변식 (위반 = 즉시 중단)

> 이 앱은 카카오 API를 클라이언트에서 직접 호출한다(BFF/프록시 없음). 키의 **번들 노출은 과제 전제**(과제가 `.env`를 이메일로 제출받는 방식)다. 따라서 "서버 은닉"이 아니라 아래 3가지를 불변식으로 지킨다.

- 카카오 REST 키는 `VITE_KAKAO_REST_API_KEY`로 두고 **`import.meta.env`로만 접근**. 소스에 키 문자열/`KakaoAK <실키>` 하드코딩 절대 금지
- `.env`·`.env.local` 등 실제 키가 담긴 파일은 **커밋 절대 금지**(`.gitignore` 필수, 커밋 이력에도 없어야 함). `.env.example`은 placeholder만 담아 커밋
- README에 **트레이드오프 명시 의무**: "실서비스라면 BFF 프록시로 키를 은닉해야 하나, 본 과제는 `.env` 이메일 제출 방식이라 클라이언트 직접 호출을 채택" 근거를 기술

## 작업 루프

1. `/planning` → `.docs/plans/{날짜}-{주제}.md` + `.backlog.md` 짝파일 생성, 사용자 합의 후 구현
2. 구현은 메인 세션 직접 수행 (에이전트 팀 불필요 규모). 리뷰 객관성 필요 시 `reviewer` 에이전트만 spawn
3. `/review` (필요시 `/security`, `/review-ui`) → `/ship` (검증→커밋→세션 리포트)
4. 개인 과제 레포 — main 직접 작업 허용
5. **과정 문서화**: 각 단계 산출물(.docs/, 세션 리포트, 커밋 히스토리)이 "Claude를 어떻게 통제하며 썼는지"의 증거가 된다. 하네스 셋팅 과정 자체는 과정 문서에서 제외

## 프로젝트 구조 규약

- `src/` 기준 수직 슬라이스. 페이지: `src/pages/{Name}Page/` = `{Name}Page.tsx`(얇은 조립) + `hooks/useXxx.ts`(페이지 상태 전부) + `components/`(Context 소비만) + `styles/*.style.ts`(tv 슬롯) — 상세: `.claude/rules/page.md`
- 데이터 3계층: `src/lib/api/index.ts`(axios가 `https://dapi.kakao.com`에 `Authorization: KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}` 헤더로 직접 요청, `validateStatus`로 성공(2xx) 판정 — 나머지는 axios가 그대로 reject) → `src/lib/api/{books,favorites}/api.ts`(순수 요청 함수, 카카오 `{ documents, meta }` 그대로 반환) + `api.interface.ts`(도메인 타입) → `api.queries.ts`(useQuery/useMutation), queryKey는 `src/lib/api/shared/queryKeys.ts` 팩토리 집중, 공유 요청/응답 타입은 `src/lib/api/shared/{request,response}.ts`(`FailResponse` = 카카오 게이트웨이 실에러 바디 `{errorType,message}`). 서버(BFF) 없는 CSR 단독 앱이라 "client" 폴더 네이밍은 두지 않음(client/server 대응 개념 자체가 없음) [2026-07-08]. 에러를 critical(에러 페이지)/recoverable(토스트)로 나누는 판단은 http 클라이언트에 두지 않고 **소비 시점(Step 4.1, `error.response?.status` 직접 참조)** 에서 함 — 미리 만든 `ApiError`/severity 분류는 과잉설계로 판단해 폐기
- 공용 UI는 `src/components/`, 공통 훅은 `src/hooks/`(useSearchHistory/useFavorites/useSearchInput/useOutsideClick), 순수 유틸은 `src/utils/`(localStorage/number). 찜·검색기록은 `src/hooks` 상태 훅 + `src/utils/localStorage` 순수 래퍼 조합(`src/lib/storage`·`src/lib/utils` 폐기, 2026-07-08 F-13)

## 테스트 정책

- unit: 순수 함수·훅 (Vitest jsdom)
- integration: API 계층 함수 + React Query 훅을 MSW(`dapi.kakao.com` 스텁)로 검증 (Vitest node)
- e2e: Playwright — ① 기능 여정(검색→결과→찜) ② **시각 정합**(DOM 실측 vs Figma). 상세 패턴은 `.claude/rules/e2e-parity.md`(e2e/** 스코프)
- 테스트 기준(AC) SOT: `.docs/spec/requirements.md`(요구사항별 `WHEN→THEN`+레벨, `[F]/[N]/[판단]/[추가]` 분류) · 시각 px SOT: `.docs/design/screens.md`(Figma 실측)
- 커밋 전 `pnpm lint && pnpm check-types && pnpm test:unit` 통과 필수

## 행동 원칙

- `.claude/rules/karpathy-principles.md` — Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven
- `.claude/rules/ai-defense.md` — 할루시네이션·컨텍스트 드리프트 방어
- 과 엔지니어링 금지: 요청 범위 초과 구현·불필요한 추상화는 하지 않는다
