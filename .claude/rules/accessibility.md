---
description: "접근성 — a11y 최소 요건, 색상 대비, 키보드 내비게이션, ARIA 속성 체크. 검색 인풋·찜 토글·도서 카드 리스트 기준."
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
---

# 접근성 규칙 — WCAG 2.2 AA

웹 콘텐츠 접근성 가이드라인 2.2 Level AA 기준 규칙. `src/**` 편집 시 자동 로드.

출처:

- [W3C WCAG 2.2 공식](https://www.w3.org/TR/WCAG22/)
- [WAI 퀵 레퍼런스](https://www.w3.org/WAI/WCAG22/quickref/)

## 최소 준수 체크리스트 (핵심 12 SC)

### 1. Perceivable (인식 가능)

- **SC 1.4.3 Contrast (Minimum) AA**: 본문 텍스트 대비 **4.5:1 이상**, 대형 텍스트(18pt+ 또는 14pt bold+) **3:1 이상**
- **SC 1.4.11 Non-text Contrast AA**: 아이콘·버튼 경계·폼 필드 경계 **3:1 이상**
- **SC 1.4.12 Text Spacing AA**: `line-height`, `letter-spacing`, `word-spacing` 조정 시 레이아웃 깨짐 없음
- **SC 1.4.13 Content on Hover or Focus AA**: hover/focus로 나타나는 콘텐츠는 dismissible, hoverable, persistent

### 2. Operable (운용 가능)

- **SC 2.1.1 Keyboard A**: 모든 interactive 요소는 키보드만으로 조작 가능
- **SC 2.4.7 Focus Visible AA**: 포커스 된 요소는 **반드시 시각적 표시** (`:focus-visible` 링 필수)
- **SC 2.4.11 Focus Not Obscured (Minimum) AA** (WCAG 2.2 신규): 포커스 요소가 sticky 헤더/푸터에 완전히 가려지면 안 됨
- **SC 2.5.8 Target Size (Minimum) AA** (WCAG 2.2 신규): 터치 타겟 **24×24 CSS 픽셀 이상** (권장 44×44)

### 3. Understandable (이해 가능)

- **SC 3.3.1 Error Identification A**: 폼 에러는 텍스트로 명확히 안내 (색상만으로 구분 금지)
- **SC 3.3.2 Labels or Instructions A**: 모든 입력 필드에 라벨 필수
- **SC 3.3.7 Redundant Entry A** (WCAG 2.2 신규): 같은 세션에서 이전에 입력한 정보 재입력 요구 금지 (자동완성 지원)

### 4. Robust (견고함)

- **SC 4.1.2 Name, Role, Value A**: 커스텀 컴포넌트는 ARIA 속성으로 역할/상태 노출

## 프로젝트별 강제 규칙

### 색상 토큰 (`@theme`)

- 모든 색상 토큰은 **대비 검증 후** 추가
- Primary × Background, Text × Background 조합은 최소 **4.5:1**
- **라이트/다크 쌍 토큰 의무** — 의미 토큰(primary, background, foreground 등)은 `@theme`(라이트) + `[data-theme="dark"]`(다크) **양쪽에 정의**, 대비 검증도 양 모드 모두 수행. 다크 미지원 시 이 규칙은 스킵 가능.

### 컴포넌트 (`src/components/**`)

- **아이콘 전용 버튼**: `aria-label` 필수 — 예: 검색 버튼(`aria-label="검색"`), 검색어 삭제 버튼(`aria-label="검색어 지우기"`)
- **찜 토글 버튼**: 토글 상태는 `aria-pressed`로 노출. 색상(하트 채움)만으로 상태 전달 금지 — `aria-label`을 상태에 맞게(`"찜하기"`/`"찜 해제"`) 갱신

```tsx
// ✅ 찜 토글 — aria-pressed + 상태별 label
<button
  type="button"
  aria-pressed={isFavorite}
  aria-label={isFavorite ? "찜 해제" : "찜하기"}
  onClick={() => favoriteHandler.toggle(book.isbn)}
>
  <HeartIcon filled={isFavorite} />
</button>
```

- **터치 타겟**: 모바일 대상 컴포넌트는 최소 **44×44px** (WCAG 2.2 권장치 적용)
- **Focus ring**: `focus:outline-none`만 두는 것 금지 — 반드시 `focus-visible:ring-*` 등으로 대체
- **Loading 상태**: 검색 로딩 인디케이터는 `role="status"` + `aria-live="polite"` 또는 `aria-busy`
- **Modal/Dialog**(상세검색 모달 등): `role="dialog"`, `aria-modal="true"`, focus trap, ESC 닫기, 이전 포커스 복원

### 페이지 (`src/pages/**/*Page.tsx`)

- **Heading 순서**: h1 → h2 → h3 … 건너뛰기 금지
- **Landmark roles**: `<main>`, `<nav>`, `<header>`, `<footer>` 명시
- **도서 카드 리스트**: 결과 목록은 `<ul>`/`<li>` 시맨틱 구조. 카드 내 대표 링크(도서 상세 URL)는 `<a>`로, 카드 제목이 링크 텍스트가 되도록 연결
- **검색 결과 개수**: "총 N건" 같은 결과 요약은 `aria-live="polite"` 영역으로 노출해 스크린리더가 갱신을 읽도록
- **Form label**: 검색 인풋은 `<label htmlFor>` 또는 `aria-label` 필수 연결 (placeholder만으로 라벨 대체 금지)

### 폼 (react-hook-form + Controller)

- 에러 메시지는 `aria-describedby`로 입력 필드에 연결
- 필수 필드는 `aria-required="true"` 또는 `required` 속성
- 에러 발생 시 첫 에러 필드로 포커스 이동 권장

## 자동 검증 수단

- `/review-ui` 스킬: Lighthouse Accessibility 점수 측정 (90+ 목표)
- 브라우저 DevTools: Lighthouse Accessibility 또는 axe DevTools

## 금지 사항

- 색상만으로 정보 전달 (에러 빨간색, 찜 상태 하트 색만 X — 아이콘·텍스트·`aria-pressed` 병기)
- `tabindex` 양수 사용 (탭 순서 조작)
- `aria-hidden="true"` 요소 내부에 focusable 요소 배치
- placeholder를 label 대체로 사용
- `<div onClick>` 같은 의미 없는 요소에 이벤트 (→ `<button>` 사용)
- 터치 타겟 24px 미만 (너무 작음)

## 참고

- 폼 패턴: `.claude/rules/react.md` (Controller 통일)
- 리뷰 절차: `/review-ui` 스킬
