---
name: review-ui
description: 브라우저에서 UI를 시각적으로 검증합니다. 정렬/간격 일관성, 사이즈 시스템 준수, a11y 최소 요건을 체크하고, 위반 사항을 자동 수정 후 재검증합니다. Lighthouse로 Performance + Accessibility 점수도 측정합니다. 트리거 - "/review-ui"
effort: medium
---

# /review-ui — UI 시각 검증 + 자동 수정 + Lighthouse

브라우저에서 변경된 UI를 시각적으로 검증하고, 위반 사항을 자동 수정한 뒤 재검증하는 스킬.

> 코드 컨벤션은 `/review`에서 수행. `/review-ui`는 브라우저 기반 시각 검증에 집중.

## 트리거

사용자가 `/review-ui`를 입력하면 실행.

## 실행 절차

### 1. 변경 범위 파악

```bash
git diff --name-only
git diff --cached --name-only
```

UI 관련 변경 파일 식별:

- `components/**` (자체 UI 컴포넌트) → 해당 컴포넌트를 사용하는 페이지에서 검증
- `app/**/page.tsx` → 해당 페이지 검증
- `app/**/*.tsx` (모달·리스트 등) → 해당 컴포넌트를 포함하는 페이지 검증

> 주요 화면: `/` (도서 검색), `/favorites` (찜 목록). 실제 라우트는 `app/` 구조를 확인해 매핑한다.

### 2. dev 서버 확인

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

- 단일 앱이므로 dev 포트는 **3000** 고정.
- 200이면 진행.
- 연결 실패 시 `pnpm dev`로 기동 (백그라운드) 후 재확인.

### 3. 브라우저 검증 + 자동 수정 루프

변경된 각 페이지/컴포넌트에 대해 **Playwright CLI를 Bash로 직접 실행**한다.

> MCP(Playwright MCP)는 사용하지 않는다. 브라우저 창을 열지 않고 headless로만 실행.

#### 스크린샷 + 콘솔 에러 + 접근성 트리 동시 캡처

```bash
mkdir -p .playwright-tmp
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3000/{path}', { waitUntil: 'networkidle', timeout: 10000 });
  await page.screenshot({ path: '.playwright-tmp/{page}.png', fullPage: true });
  const snapshot = await page.accessibility.snapshot();
  await browser.close();
  console.log(JSON.stringify({ errors, a11y: snapshot }, null, 2));
  if (errors.length) process.exit(1);
})().catch(e => { console.error(e.message); process.exit(1); });
"
```

스크린샷 확인:
```
Read(.playwright-tmp/{page}.png)  ← 이미지로 시각 검증
```

#### 자동 수정 루프 규칙

```
위반 발견 → 코드 수정 → Playwright 재실행 → 통과? → 다음 페이지
                                            ↓ 실패
                                       재수정 (최대 3회)
                                            ↓ 3회 실패
                                       사용자에게 보고 (수동 판단 필요)
```

**자동 수정 가능 항목** (루프 대상):

| 위반 유형            | 수정 방법                                          |
| -------------------- | -------------------------------------------------- |
| 콘솔 에러 (런타임)   | 코드 수정 후 재검증                                |
| @theme 미정의 색상   | @theme 토큰으로 교체 또는 globals.css @theme 블록에 추가 |
| overflow/텍스트 잘림 | width/padding/truncate 조정                        |
| aria 속성 누락       | role, aria-label 등 추가                           |
| 시맨틱 HTML 부적절   | 태그 교체 (`div` → `nav`, `button` 등)             |
| gap/padding 불일치   | 같은 맥락 요소에 동일 spacing 적용                 |

**수동 판단 필요 항목** (보고만):

- 디자인 의도가 불명확한 레이아웃 변경
- 반응형 브레이크포인트 결정
- 컴포넌트 구조 변경이 필요한 경우

#### 재검증 방법

수정 후 동일 Playwright CLI 명령으로 재실행. 스크린샷은 `.playwright-tmp/`에 저장 후 Read 도구로 이미지 확인.

### 4. Lighthouse 체크 (Performance + Accessibility)

모든 시각 검증이 통과한 후, 변경된 페이지에 대해 Lighthouse 실행. (lighthouse는 devDependency가 아님 — npx on-demand 다운로드라 최초 실행이 느릴 수 있음)

```bash
npx lighthouse http://localhost:3000/[page] \
  --chrome-flags="--headless=new" \
  --output json \
  --output-path .playwright-tmp/lighthouse-report.json \
  --only-categories=performance,accessibility \
  --preset=desktop \
  --quiet
```

**점수 추출:**

```bash
cat .playwright-tmp/lighthouse-report.json | jq '{
  performance: (.categories.performance.score * 100),
  accessibility: (.categories.accessibility.score * 100)
}'
```

**기준:**

| 카테고리      | 기준   | 비고                                     |
| ------------- | ------ | ---------------------------------------- |
| Accessibility | >= 90  | 미달 시 위반 사항으로 보고               |
| Performance   | 참고용 | dev 서버라 정확도 낮음. 50 미만이면 경고 |

> **주의**: `next dev`는 개발 모드라 Performance 점수가 낮게 나옴. 정확한 성능 측정은 `next build && next start` 후 실행 필요. Accessibility 점수는 dev 모드에서도 유효.

**Lighthouse 위반 자동 수정:**

Accessibility 점수가 90 미만일 때 → 실패한 audit 항목 확인 → 수정 가능하면 자동 수정 → Lighthouse 재실행 (최대 2회)

```bash
# 실패한 accessibility audit 확인
cat .playwright-tmp/lighthouse-report.json | jq '
  [.audits | to_entries[] | select(.value.score != null and .value.score < 1)
   | select(.key | startswith("color-contrast") or startswith("aria-") or startswith("label") or startswith("button-name") or startswith("image-alt"))
   | {id: .key, title: .value.title, score: .value.score}]
'
```

### 5. UI Consistency 점수 산출

시각 검증 체크리스트 위반을 기반으로 UI Consistency 점수를 산출한다.

**감점 테이블:**

| 위반 유형            | 감점 | 비고                           |
| -------------------- | ---- | ------------------------------ |
| 정렬 불일치          | -10  | 좌우/수직 정렬                 |
| 간격 불균일          | -10  | 같은 맥락에서 다른 gap/padding |
| 사이즈 혼재          | -10  | 같은 맥락에서 sm/md/lg 혼용    |
| @theme 미사용 색상   | -5   | 하드코딩 hex 사용              |
| overflow/텍스트 잘림 | -15  | 콘텐츠 잘림                    |
| 인터랙션 오류        | -20  | 클릭/hover/focus 미동작        |
| 폰트 불일치          | -5   | 같은 레벨에서 다른 font 클래스 |
| 상태 UI 부재         | -10  | 로딩/빈/에러 상태 미처리       |

```
UI Consistency = 100 - sum(위반 × 감점), 최소 0
```

**기준:** >= 80 통과, < 80 수정 필요

### 6. 결과 보고

```
## /review-ui 결과

### 점수
| 차원 | 점수 | 기준 | 상태 |
|------|------|------|------|
| Accessibility | 95 | >= 90 | PASS |
| Performance | 72 | 참고용 | - |
| UI Consistency | 85 | >= 80 | PASS |

### Quality Gate: PASS / FAIL
- Accessibility >= 90
- UI Consistency >= 80

### 시각 검증
- 검증 페이지: N개
- 자동 수정: M건 (수정 → 재검증 통과)
- 수동 판단 필요: K건

### 위반 사항 (있는 경우)

**페이지: `/` (도서 검색)**
1. [정렬 -10] 검색 결과 카드 사이 간격 불일치 → 자동 수정 완료
2. [a11y] Lighthouse: color-contrast 실패 → 수동 판단 필요

### 통과
- `/favorites` (찜 목록): 위반 없음
```

---

## 체크리스트

### [UI 일관성] — 시각적 확인

- [ ] 정렬이 일관적인가 (좌우 정렬, 수직 중앙 정렬 등)
- [ ] 요소 간 간격이 균일한가 (같은 맥락의 요소는 같은 gap)
- [ ] 텍스트가 잘리거나 overflow되지 않는가
- [ ] 반응형: 뷰포트 축소 시 레이아웃 깨지지 않는가
- [ ] 인터랙션 정상 동작 (클릭, hover, focus, 키보드 네비게이션)
- [ ] 로딩/빈 상태/에러 상태가 자연스러운가 (검색 결과 없음, 네트워크 에러 등)

### [사이즈 일관성] — 디자인 시스템 준수

- [ ] 컴포넌트 간 동일 맥락에서 같은 size prop 사용 (sm/md/lg 혼재 금지)
- [ ] 간격: 같은 섹션 내 gap/padding이 일관적인가
- [ ] 폰트: 같은 레벨의 제목/본문이 같은 font 클래스 사용
- [ ] 색상: `@theme`에 정의된 디자인 토큰만 사용 (하드코딩 hex 금지)

### [코드 품질] — UI 컴포넌트 코드

- [ ] Tailwind 클래스 가독성 — 관련 속성 그룹핑 (layout → spacing → typography → color → effect)
- [ ] `tv()` slots 가독성 — slot별 역할 명확, 불필요한 빈 slot 없음, variants/compoundVariants 누락 없음
- [ ] 자체 UI 컴포넌트 패턴과 일관성 (`@theme` 토큰 참조, `tv()` 슬롯 구조, Props 확장 방식)

### [a11y 최소] — 공통 UI 컴포넌트 + 페이지 레벨

- [ ] 인터랙티브 요소에 적절한 role 부여 (dialog, listbox 등)
- [ ] 모달: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- [ ] 폼 필드(검색 입력 등): `<label>` 연결 또는 `aria-label`
- [ ] 버튼: 아이콘만 있는 경우 `aria-label` 필수 (찜 토글, 상세 펼침 등)
- [ ] 키보드 접근성: Tab 순서 자연스러운가, focus trap 정상 동작
- [ ] 페이지 레벨: 시맨틱 HTML 사용 (`<nav>`, `<main>`, `<section>`, `<button>` 등)

### [Lighthouse] — Performance + Accessibility

- [ ] Accessibility 점수 >= 90
- [ ] Performance 점수 확인 (참고용, 50 미만이면 경고)
- [ ] 실패한 audit 항목 확인 및 수정 가능 여부 판단

---

## 주의사항

- 자동 수정 가능 항목은 **수정 → 재검증 루프** (최대 3회)
- 수동 판단 필요 항목만 사용자에게 보고
- Playwright는 **Bash 도구로 CLI 직접 실행** (`node -e "..."` + `headless: true`) — MCP 사용 금지, 브라우저 창 열기 금지
- 스크린샷은 `.playwright-tmp/`에 저장 → Read 도구로 이미지 확인 (시각 검증)
- a11y는 공통 UI 컴포넌트 + 페이지 레벨 시맨틱 HTML을 확인
- 수정 시 기존 UX 동작 보존
- Lighthouse는 dev 모드에서 실행 → Performance는 참고용, Accessibility는 신뢰 가능
- Lighthouse/스크린샷 파일은 `.playwright-tmp/`에 저장 (gitignore 대상)
