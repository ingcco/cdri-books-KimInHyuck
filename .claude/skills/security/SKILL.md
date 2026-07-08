---
name: security
description: OWASP Top 10 기반 보안 리뷰. 카카오 API 클라이언트 직접 호출, 입력 검증, 시크릿(카카오 REST 키) 하드코딩/.env 커밋 방지, 민감 데이터 처리를 체크합니다. 트리거 - "/security", "보안 리뷰", "보안 체크"
effort: xhigh
---

# /security — 보안 리뷰

변경된 코드 또는 지정된 범위를 OWASP Top 10 + 프로젝트 특화 기준으로 리뷰하는 스킬.

> **보안 체크 기준 SOT**: 본 체크리스트(OWASP A01~A10 + 카카오 API 키 취급)가 보안 검사 기준의 단일 출처다. `/review`의 Security 차원이 이 체크리스트를 참조 로드한다(severity 매핑: Critical→`Blocker`, Warning→`Major`). 본 스킬 단독 호출은 심층·범위 지정 보안 리뷰 용도.

> **과제 특성**: 인증/인가·DB·서버(BFF)가 없는 순수 CSR 도서 검색 앱이다. 카카오 API를 **클라이언트에서 직접 호출**하므로 REST 키의 **번들 노출은 과제 전제**(과제가 `.env`를 이메일로 제출받는 방식)다. 따라서 "키를 서버에 은닉했는가"가 아니라 ① `.env*` 커밋 방지 ② 키 하드코딩 방지(`import.meta.env` 접근만) ③ README 트레이드오프 명시 ④ 에러 UI에 카카오 원문/키 미노출 — 이 4가지가 보안 초점이다. 인증/세션 관련 항목은 "해당 없음"으로 표기한다.

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

| 영역           | 매칭 패턴                                 | 체크리스트                          |
| -------------- | ----------------------------------------- | ----------------------------------- |
| **API 계층**   | `src/lib/api/**`                          | 키 하드코딩 방지 + 입력검증 + 에러 정규화 |
| **클라이언트** | `src/pages/**/*.tsx`, `src/components/**` | XSS + 에러 UI에 키/원문 미노출      |
| **설정 파일**  | `.env*`, `vite.config.*`, `*.json`        | 시크릿 하드코딩·`.env` 커밋 여부    |

### 2. 체크리스트 순회

해당 영역의 체크리스트만 적용. **카카오 API 키 취급** 절은 API 계층/설정/`.env` 변경 시 항상 적용.

### 3. 결과 보고

```
## /security 결과

### 🔴 Critical (즉시 수정)
**`파일경로`**
1. [키 하드코딩] 소스에 `KakaoAK <실키>` 문자열 하드코딩 — `import.meta.env.VITE_KAKAO_REST_API_KEY`로 이동 (line 3)

### 🟡 Warning (권장 수정)
**`파일경로`**
1. [A03:XSS] 카카오 응답의 contents를 dangerouslySetInnerHTML로 렌더 (line 45)

### 🟢 통과
- `파일경로`: 보안 이슈 없음
```

### 4. 확인 후 수정

사용자 승인 후 Critical → Warning 순으로 수정.

---

## 🔑 카카오 API 키 취급 체크리스트 (최우선)

키의 **번들 노출은 과제 전제**다(BFF 없음). 따라서 "서버 은닉"이 아니라 아래 4항목을 검사한다. `.env`/API 계층/설정 변경 시 항상 적용.

### (a) `.env*`가 `.gitignore`에 있고 커밋 이력에 없음

```bash
# .env* 가 gitignore 되는지
grep -qE '(^|/)\.env' .gitignore && echo "OK: .env* gitignore" || echo "!! .env 미포함 — 추가 필요 (Critical)"

# 실제 키 파일이 이미 트래킹되고 있지 않은지 (커밋 이력 노출 = Critical)
git ls-files --error-unmatch .env .env.local 2>/dev/null && echo "!! .env 커밋됨 — Critical (키 재발급 필요)" || echo "OK: .env 미커밋"

# 과거 커밋 이력에 키 파일이 들어간 적 있는지
git log --all --oneline --name-only 2>/dev/null | grep -E '(^|/)\.env(\.local)?$' && echo "!! 이력에 .env 존재 — history 정리 + 키 rotate" || echo "OK: 이력 clean"
```

- `.env`, `.env.local` 등 실제 키 파일은 커밋 금지. `.env.example`(placeholder만)은 커밋 가능.

### (b) 키 하드코딩 금지 — `import.meta.env` 접근만

```bash
# 소스에 KakaoAK <실키> 리터럴 / 32자리 hex 하드코딩 (Critical)
grep -rEn "KakaoAK\s+[0-9a-fA-F]{20,}" src 2>/dev/null

# Authorization 헤더에 키 문자열 직접 할당
grep -rEn "Authorization['\"]?\s*:\s*['\"]KakaoAK\s+[A-Za-z0-9]+['\"]" src 2>/dev/null

# apiKey/token 변수에 문자열 리터럴 직접 할당
grep -rEn "(apiKey|API_KEY|token|KAKAO_KEY)\s*[:=]\s*['\"][A-Za-z0-9]{20,}['\"]" src 2>/dev/null
```

- 키는 오직 `import.meta.env.VITE_KAKAO_REST_API_KEY`로만 접근한다. 소스 어디에도 실제 키 문자열이 없어야 한다.
- 검출되면 `.env.local`로 옮기고 `.env.example`에 placeholder(`VITE_KAKAO_REST_API_KEY=`) 추가.

### (c) README에 트레이드오프 명시

- 키 번들 노출이 **의도된 과제 전제**임과, **실서비스라면 BFF 프록시로 은닉**해야 한다는 트레이드오프가 README에 기술되어 있는지 확인.

```bash
grep -qiE 'BFF|프록시|proxy|은닉|트레이드오프|trade' README.md && echo "OK: 트레이드오프 문구 존재" || echo "!! README 트레이드오프 미기술 — 추가 필요 (Warning)"
```

### (d) 에러 UI에 카카오 원문 에러/키 미노출

- 카카오 호출 실패 시 upstream 응답 본문·상태 원문·요청 헤더(Authorization=`KakaoAK` 키 포함)를 **그대로 화면/콘솔에 노출하지 않는다**.
- axios 인터셉터에서 자체 코드·메시지로 정규화(예: `throw new AppError("UPSTREAM_ERROR", "도서 검색에 실패했습니다.")`).
- catch/토스트/에러 UI에서 `error.config`, `error.request.headers`(키 포함)를 렌더/로깅하지 않는지 확인.

```bash
# 에러 객체를 통째로 노출하는 패턴 (config/headers에 키가 실려 있음)
grep -rEn "error\.(config|request)|JSON\.stringify\(error\b" src 2>/dev/null
```

### (e) 제출용 소스 청결도 — 타 프로젝트명·작업 과정 주석 미노출

면접관이 직접 읽는 코드다. `src/**`·설정 파일에 다른 프로젝트/조직명, Figma 노드 ID·PAT, "재검증"/"발견" 같은 작업 로그성 주석이 남아있지 않은지 확인(`.claude/hooks/guard-source-hygiene.sh`가 Write/Edit 시점에 이미 차단하지만, 그 이전에 작성된 내용은 별도 확인 필요).

```bash
grep -rniE "web-andrsen|vxt-fashion-admin|klleon|hururup" src eslint.config.js vite.config.ts package.json .env.example index.html 2>/dev/null
grep -rEn "figd_[A-Za-z0-9_-]+" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" 2>/dev/null | grep -v node_modules
```

검출되면 즉시 제거. 최종 제출 직전에는 `.docs`/`.claude`도 포함해 전수조사(범위 확대는 `/ship` 최종 단계에서).

---

## 체크리스트 (OWASP Top 10)

### [A01] Broken Access Control — 접근 제어

**해당 없음** — 근거: 로그인/세션/역할이 없고, 사용자 소유 리소스가 없는 공개 검색 API. 접근을 제어할 보호 대상이 존재하지 않음. (찜 목록은 서버가 아닌 클라이언트 localStorage에 저장되어 사용자 간 격리 대상 아님.)

### [A02] Cryptographic Failures — 암호화 / 민감 데이터

**민감 데이터** (취급 대상은 카카오 키뿐, 번들 노출은 과제 전제)

- [ ] 로그(`console.log`/에러 로거)에 카카오 REST 키·`KakaoAK` 헤더 미출력
- [ ] 에러 UI/토스트/콘솔에 카카오 원문 에러·요청 헤더(키 포함) 미노출 (→ 카카오 키 취급 (d))
- [ ] 소스에 키 문자열 하드코딩 없음 — `import.meta.env` 접근만 (→ (b))
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

- [ ] `.env*` 파일이 `.gitignore`에 포함 + 커밋 이력에 없음 (→ 카카오 키 취급 (a))
- [ ] 에러 UI/콘솔에 stack trace·카카오 원문 응답 미노출
- [ ] axios 인터셉터가 에러를 자체 코드/메시지(`AppError` 등)로 정규화 — 카카오 raw 에러 그대로 전파 금지

**시크릿 하드코딩 (자동 grep 검증)**

다음 패턴이 소스에서 검출되면 즉시 `.env.local`로 분리:

```bash
# 카카오 인증 헤더에 키 하드코딩 (KakaoAK {32자리 hex})
grep -rEn "KakaoAK\s+[0-9a-fA-F]{20,}" src 2>/dev/null

# Authorization 헤더 하드코딩
grep -rEn "Authorization['\"]?\s*:\s*['\"]KakaoAK\s+[A-Za-z0-9]+['\"]" src 2>/dev/null

# apiKey/token 변수에 문자열 리터럴 직접 할당
grep -rEn "(apiKey|API_KEY|token)\s*[:=]\s*['\"][A-Za-z0-9]{20,}['\"]" src 2>/dev/null
```

검출되면 `import.meta.env.VITE_KAKAO_REST_API_KEY`로 이동하고, `.env.example`에 placeholder 추가.

**환경변수 분리 후 점검:**

- [ ] `.env*`이 `.gitignore`에 포함 + 미커밋 재확인
- [ ] 프로덕션 빌드(`pnpm build`) 산출물에 `VITE_KAKAO_REST_API_KEY`가 번들로 주입됨을 인지 (CSR 직접 호출 전제). 배포는 미채택 — 배포 시 키가 공개 URL에 실노출됨을 README 트레이드오프에 명시
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

### [A10] SSRF — 요청 위조

**서버가 없어 전통적 SSRF는 해당 없음**. 클라이언트 요청 대상 고정만 확인:

- [ ] axios **baseURL(`https://dapi.kakao.com`)은 코드에 상수로 고정** — 사용자 입력은 검색어/페이지 파라미터로만 전달되고 요청 대상 도메인을 제어할 수 없음
- [ ] 사용자 입력을 그대로 `axios.get(userInput)` 대상 URL로 사용하지 않음

---

## 프로젝트 특화 체크

### 카카오 API 클라이언트 (`src/lib/api/index.ts`, BFF/프록시 없음)

> 이 앱은 카카오 API를 클라이언트에서 직접 호출한다. 키의 **번들 노출은 과제 전제**(`.env` 이메일 제출 방식)이므로 "서버 은닉"이 아니라 아래 3가지를 불변식으로 확인한다(CLAUDE.md "보안 불변식" SOT).

- [ ] 키 주입은 axios 인스턴스 한 곳(`src/lib/api/index.ts`)에 집중, `import.meta.env.VITE_KAKAO_REST_API_KEY`로만 참조 (소스에 `KakaoAK <실키>` 하드코딩 없음)
- [ ] `.env`·`.env.local`이 `.gitignore`에 있고 커밋 이력에 없음. `.env.example`은 placeholder만
- [ ] 페이지네이션 상한·검색어 검증으로 upstream 남용/rate-limit 소진 방지
- [ ] 카카오 에러 응답은 인터셉터에서 안전한 메시지로 치환 (→ (e), 원문 그대로 노출 금지)
- [ ] README에 BFF 미도입 트레이드오프가 명시돼 있음

---

## 주의사항

- Critical은 즉시 수정 권장, Warning은 컨텍스트에 따라 판단
- `pnpm audit`·`pnpm build` 실행은 사용자 확인 후 (네트워크/시간 필요)
- 보안 수정은 기존 기능을 깨뜨리지 않는 선에서 진행
- 의심스러운 패턴은 **보고 먼저**, 사용자 판단 대기
