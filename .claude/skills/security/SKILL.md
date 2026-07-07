---
name: security
description: OWASP Top 10 기반 보안 리뷰. API Route(카카오 프록시), 입력 검증, 시크릿(카카오 REST 키) 은닉, 민감 데이터 처리를 체크합니다. 트리거 - "/security", "보안 리뷰", "보안 체크"
effort: xhigh
---

# /security — 보안 리뷰

변경된 코드 또는 지정된 범위를 OWASP Top 10 + 프로젝트 특화 기준으로 리뷰하는 스킬.

> **보안 체크 기준 SOT**: 본 체크리스트(OWASP A01~A10 + 카카오 API 키 은닉)가 보안 검사 기준의 단일 출처다. `/review`의 Security 차원이 이 체크리스트를 참조 로드한다(severity 매핑: Critical→`Blocker`, Warning→`Major`). 본 스킬 단독 호출은 심층·범위 지정 보안 리뷰 용도.

> **과제 특성**: 인증/인가·DB가 없는 공개 도서 검색 앱이다. 서버가 보호할 대상은 **카카오 REST 키 하나**뿐이며, 나머지 위협면은 입력 검증·XSS·시크릿 노출·의존성으로 좁혀진다. 인증/세션 관련 항목은 "해당 없음"으로 표기한다.

## 트리거

사용자가 `/security` 또는 `/security [범위]`를 입력하면 실행.
범위 미지정 시 `git diff`로 변경된 파일 대상.

## 실행 절차

### 1. 대상 파일 파악

```bash
git diff --name-only
git diff --cached --name-only
```

변경이 없으면 사용자에게 범위 지정을 요청.

파일을 보안 관심 영역으로 분류:

| 영역           | 매칭 패턴                             | 체크리스트                        |
| -------------- | ------------------------------------- | --------------------------------- |
| **API Route**  | `app/api/**/route.ts`                 | 입력검증 + 응답 봉투 + 에러 은닉  |
| **Service**    | `app/api/**/service.ts`, `lib/http/**`| 카카오 키 은닉 + upstream 호출    |
| **클라이언트** | `app/**/*.tsx`, `components/**`       | XSS + 키 노출                     |
| **설정 파일**  | `.env*`, `next.config.*`, `*.json`    | 시크릿 노출                       |

### 2. 체크리스트 순회

해당 영역의 체크리스트만 적용. **카카오 API 키 은닉** 절은 API Route/Service/설정 변경 시 항상 적용.

### 3. 결과 보고

```
## /security 결과

### 🔴 Critical (즉시 수정)
**`파일경로`**
1. [키 은닉] KAKAO_REST_API_KEY가 NEXT_PUBLIC_ 접두사로 노출됨 (line 3)

### 🟡 Warning (권장 수정)
**`파일경로`**
1. [A03:XSS] 카카오 응답의 contents를 dangerouslySetInnerHTML로 렌더 (line 45)

### 🟢 통과
- `파일경로`: 보안 이슈 없음
```

### 4. 확인 후 수정

사용자 승인 후 Critical → Warning 순으로 수정.

---

## 🔑 카카오 API 키 은닉 체크리스트 (최우선)

서버가 보호할 유일한 시크릿이 카카오 REST 키다. 아래 6항목은 API Route/Service/설정 변경 시 반드시 검사한다.

### (a) `NEXT_PUBLIC_` 접두사 키 금지

```bash
# NEXT_PUBLIC_ 로 카카오 키를 노출하면 클라이언트 번들에 인라인됨 → 즉시 Critical
grep -rniE "NEXT_PUBLIC_[A-Z_]*KAKAO" . --include="*.ts" --include="*.tsx" --include=".env*" 2>/dev/null
```

- 카카오 키 env 이름은 `KAKAO_REST_API_KEY` (접두사 없음, 서버 전용). `NEXT_PUBLIC_` 로 시작하는 순간 브라우저 번들에 박히므로 금지.

### (b) 빌드 산출물(`.next`)에서 키 문자열 grep 검사

```bash
pnpm build
# .env.local의 실제 키 값이 산출물에 새어나갔는지 검사
KEY=$(grep -oE 'KAKAO_REST_API_KEY=.*' .env.local 2>/dev/null | cut -d= -f2-)
if [ -n "$KEY" ]; then
  grep -rn "$KEY" .next/ 2>/dev/null && echo "!! 산출물에 키 노출 — Critical" || echo "OK: 산출물에 키 없음"
fi
# 카카오 인증 헤더 접두사가 클라이언트 청크에 있으면 안 됨 (KakaoAK {키})
grep -rn "KakaoAK" .next/static 2>/dev/null && echo "!! 클라이언트 청크에 인증 헤더 — Critical" || echo "OK: 클라이언트 청크 clean"
```

### (c) `.env*`가 `.gitignore`에 포함

```bash
grep -qE '(^|/)\.env' .gitignore && echo "OK: .env* gitignore" || echo "!! .env 미포함 — 추가 필요"
```

- `.env`, `.env.local` 등 실제 키가 담긴 파일이 커밋되지 않는지 확인. `.env.example`(placeholder만)은 커밋 가능.

### (d) 키 사용은 Route Handler(server)에서만

- `KAKAO_REST_API_KEY` / `KakaoAK` 헤더 주입은 `app/api/**` 또는 `lib/http/kakao.ts`(서버 전용 모듈)에서만 일어난다.
- `"use client"` 컴포넌트, `components/**`, 클라이언트 훅에서 `process.env.KAKAO_*` 참조 금지.

```bash
# 클라이언트 코드에서 키 참조 여부
grep -rn "process.env.KAKAO" app --include="*.tsx" 2>/dev/null
grep -rln "\"use client\"" app components | xargs grep -l "KAKAO" 2>/dev/null
```

### (e) 에러 응답에 upstream(카카오) 원문/키 미노출

- 카카오 호출 실패 시 upstream 응답 본문·상태 원문·요청 헤더(키 포함)를 그대로 클라이언트로 흘리지 않는다.
- 자체 코드/메시지로 치환 (예: `fail("UPSTREAM_ERROR", "도서 검색에 실패했습니다.", 502)`).
- catch 블록에서 `error.config`, `error.request.headers`(Authorization=KakaoAK 키 포함)를 응답에 담지 않는지 확인.

### (f) 클라이언트로 전달되는 응답 봉투에 불필요 헤더 미포함

- 카카오 axios 응답 객체(`res.headers`, `res.config`)를 그대로 반환하지 말고 **필요한 데이터 필드만 DTO로 매핑**해 봉투에 담는다.
- Route Handler 응답에 카카오 rate-limit·인증 관련 헤더를 전파하지 않는다.

---

## 체크리스트 (OWASP Top 10)

### [A01] Broken Access Control — 접근 제어

**해당 없음** — 근거: 로그인/세션/역할이 없고, 사용자 소유 리소스가 없는 공개 검색 API. 접근을 제어할 보호 대상이 존재하지 않음. (찜 목록은 서버가 아닌 클라이언트 localStorage에 저장되어 사용자 간 격리 대상 아님.)

### [A02] Cryptographic Failures — 암호화 / 민감 데이터

**민감 데이터** (암호화할 자격증명은 카카오 키뿐)

- [ ] 로그(`console.log`/에러 로거)에 카카오 REST 키·`KakaoAK` 헤더 미출력
- [ ] 클라이언트로 나가는 응답에 키/원문 헤더 미포함 (→ 카카오 키 은닉 (e)(f))
- [ ] 비밀번호 해싱 등: **해당 없음** — 저장하는 자격증명 없음

### [A03] Injection — 인젝션

**XSS** (카카오 응답 렌더링이 주 위협면)

- [ ] 카카오 응답(title/contents/authors 등)을 `dangerouslySetInnerHTML`로 렌더하지 않음 (필요 시 DOMPurify)
- [ ] 사용자 입력·검색어를 URL/href에 직접 할당하지 않음 (`javascript:` 프로토콜 차단)
- [ ] `eval()`, `Function()`, `innerHTML` 미사용

**SQL/ORM**: **해당 없음** — DB/ORM 없음.

**Command Injection**

- [ ] 서버에서 `child_process.exec()` 미사용

### [A04] Insecure Design — 안전하지 않은 설계

**인증 흐름**: **해당 없음** — 인증 없음.

**비즈니스 로직**

- [ ] 페이지네이션 파라미터(page/size)에 상한 적용 (무제한 요청으로 upstream 남용 방지)
- [ ] 검색어 길이·형식을 서버에서도 검증 (클라이언트 값 무신뢰)

### [A05] Security Misconfiguration — 보안 설정 오류

**환경 설정**

- [ ] `.env*` 파일이 `.gitignore`에 포함 (→ 카카오 키 은닉 (c))
- [ ] 에러 응답에 stack trace/내부 경로 미포함 (prod)
- [ ] 응답 봉투가 자체 스키마(`ok`/`error.code`)로 일관되며 내부 구현 노출 없음

**시크릿 하드코딩 (자동 grep 검증)**

다음 패턴이 소스에서 검출되면 즉시 환경변수로 분리:

```bash
# 카카오 인증 헤더에 키 하드코딩 (KakaoAK {32자리 hex})
grep -rEn "KakaoAK\s+[0-9a-f]{20,}" app lib 2>/dev/null

# Authorization 헤더 하드코딩
grep -rEn "Authorization['\"]?\s*:\s*['\"]KakaoAK\s+[A-Za-z0-9]+['\"]" app lib 2>/dev/null

# apiKey/token 변수에 문자열 리터럴 직접 할당
grep -rEn "(apiKey|API_KEY|token)\s*[:=]\s*['\"][A-Za-z0-9]{20,}['\"]" app lib 2>/dev/null
```

검출되면 `process.env.KAKAO_REST_API_KEY`(서버 전용 Route Handler)로 이동하고, `.env.example`에 placeholder 추가.

**환경변수 분리 후 점검:**

- [ ] `.env*`이 `.gitignore`에 포함되어 있는지 재확인
- [ ] Vercel 프로젝트 환경변수에 `KAKAO_REST_API_KEY` 등록 (빌드/런타임)
- [ ] 기존 커밋 이력에 키 노출 시 카카오 콘솔에서 키 재발급 (rotate)

### [A06] Vulnerable Components — 취약한 컴포넌트

- [ ] 주요 의존성 최신 패치 버전 사용
- [ ] `pnpm audit` 결과 critical/high 취약점 없음

### [A07] Authentication Failures — 인증 실패

**해당 없음** — 근거: 로그인/토큰/세션 자체가 없는 공개 검색 앱.

### [A08] Data Integrity — 데이터 무결성

- [ ] 검색 파라미터를 Zod `safeParse`로 검증 후 사용 (직접 searchParams 사용 금지)
- [ ] 카카오 응답을 신뢰하지 않고 필요한 필드만 스키마로 매핑 (형태 변화 대비)

### [A09] Logging & Monitoring — 로깅

- [ ] `console.log`로 카카오 키·인증 헤더·요청 URL(키 쿼리) 미출력
- [ ] upstream 에러 로깅 시 요청 헤더(Authorization) 마스킹

### [A10] SSRF — 서버 사이드 요청 위조

- [ ] 카카오 upstream **URL(host)은 서버에서 하드코딩** — 사용자 입력은 검색어/페이지 파라미터로만 전달되고 요청 대상 도메인을 제어할 수 없음
- [ ] 사용자 입력을 그대로 `fetch(userInput)` 대상 URL로 사용하지 않음

---

## 프로젝트 특화 체크

### 카카오 프록시 Route (`app/api/books/route.ts`, `service.ts`, `lib/http/kakao.ts`)

- [ ] 키 주입은 서버 전용 모듈 한 곳(`lib/http/kakao.ts`)에 집중 (→ 카카오 키 은닉 (d))
- [ ] 페이지네이션 상한·검색어 검증으로 upstream 남용/rate-limit 소진 방지
- [ ] 응답은 필요한 필드만 DTO로 매핑 (→ (f)), 에러는 자체 코드로 치환 (→ (e))
- [ ] 클라이언트는 자체 `/api/books`만 호출, 카카오 도메인 직접 호출 없음

---

## 주의사항

- Critical은 즉시 수정 권장, Warning은 컨텍스트에 따라 판단
- `pnpm audit`·`pnpm build` 실행은 사용자 확인 후 (네트워크/시간 필요)
- 보안 수정은 기존 기능을 깨뜨리지 않는 선에서 진행
- 의심스러운 패턴은 **보고 먼저**, 사용자 판단 대기
