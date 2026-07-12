# 디자인 토큰 — certicos Books

> 출처(정확도 순): ① **Figma REST API 실측** (lastModified 2024-10-02) ② Figma export PNG 픽셀 샘플링 ③ 화면 관찰.
> 아래 값은 전부 ①에서 추출한 노드 원본 값이며, ②로 교차 검증됨.
> **재검증 완료 (2026-07-08)**: "Style" 컴포넌트(node `753:96`)를 REST API로 재조회 — 색상 9종 **값**은 기존 문서와 100% 일치(실제 목업 화면 node `18:805`에서 사용된 색상도 전부 이 9종 안에서만 커버됨, 미정의 색상 0건). 타이포는 lh 값 보완(§2 갱신 — 특히 `small` lh는 기존 문서의 16이 오기, 실제 base 값은 10).
> **전 화면 재실측 (2026-07-08, figma-visual-parity)**: 6개 프레임 auto-layout·좌표·per-character 색 override 전량 재추출 — 색 9종·타이포 8종 **값 전부 유효**(변경 없음). 화면별 요소 px는 `screens.md` "실측 정합 SOT" 참조. 발견: ① 카운트 "총 N건"의 숫자만 `primary` per-char override(라벨은 `#353C49`) ② Header 탭 active/inactive **색 동일**(`#353C49`), 구분은 언더라인만(→ Header 구현 이슈, tokens 무관).
> **네이밍 정정 (2026-07-08)**: `src/index.css` 구현이 토큰 **이름**을 Figma 원본과 다르게 붙였던 것을 발견(`red`→`like`, `gray`→`like-off`, `black`→`input-text`로 임의 변경 + Style 9종에 없는 `icon`/`divider`/`title-black`을 전역 토큰으로 추가) — 전부 Figma 원본 명칭 1:1로 되돌리고, 9종 밖 색상은 전역 토큰에서 제거(§1 "비-토큰 색" 절 참조).

## 1. 색상

### Palette (Style 프레임 정의)

| 토큰 | Hex | 용도 (실제 사용 노드 기준) |
|---|---|---|
| `primary` | `#4880EE` | 구매하기·검색하기 버튼 fill, 활성 탭 언더라인, 카운트 숫자, 팝업 활성 인풋 언더라인 |
| `red` | `#E84118` | 찜 하트(fill 상태) |
| `gray` | `#DADADA` | 찜 하트(line 상태, 미찜) |
| `light-gray` | `#F2F4F6` | 검색 인풋 배경, 상세보기 버튼 배경 |
| `white` | `#FFFFFF` | 페이지 배경, primary 버튼 텍스트, 팝업 배경 |
| `black` | `#222222` | 검색 인풋 입력 텍스트 |

### Text (Style 프레임 정의)

| 토큰 | Hex | 용도 |
|---|---|---|
| `text-primary` | `#353C49` | 제목·가격·본문, 로고 |
| `text-secondary` | `#6D7582` | 리스트 저자명, 상세보기 버튼 텍스트 |
| `text-subtitle` | `#8D94A0` | placeholder, 상세검색 버튼, 원가/할인가 라벨, 아코디언 저자명 |

### 비-토큰 색 (Style 프레임 9종에 없음, 실사용 노드에서만 발견 — **전역 `@theme` 토큰화 금지**)

**원칙(2026-07-08 확정)**: Figma "Style" 레이어(node `753:96`)가 정의한 팔레트 9종(Palette 6 + Text 3)만 `@theme` 전역 토큰으로 승격한다. 그 외 색상은 재사용 빈도와 무관하게 실사용처의 컴포넌트 스코프 CSS 또는 Tailwind arbitrary value(`text-[#b1b8c0]` 등)로 처리 — 디자인 시스템에 없는 값을 임의로 전역화하지 않는다.

| Hex | 용도(실사용 노드) | 처리 방침 |
|---|---|---|
| `#B1B8C0` | chevron·닫기 아이콘 | Phase 3 아이콘 컴포넌트에서 arbitrary value |
| `#D2D6DA` | 리스트 구분선(1px), 팝업 비활성 언더라인 | Phase 3/4 해당 컴포넌트에서 arbitrary value |
| `#1A1E27` | 페이지 섹션 제목("도서 검색", 단일 사용) | Phase 4 페이지 제목에서 arbitrary value |

접근성(WCAG 대비, white 배경): `text-primary` 10.9:1 ✅ · `text-secondary` 5.0:1 ✅ · `text-subtitle` 3.5:1(보조 전용) · `primary` 위 white 텍스트 3.9:1 → 버튼 텍스트는 16px/500이므로 AA large text(3:1) 통과, 단 focus ring 등으로 보완.

## 2. 타이포그래피

폰트: **Noto Sans KR** (Figma 실측 — 전 UI 노드 공통). ~~`next/font/google` 서브셋 로드~~ — Vite 전환으로 무효(Next.js 전용 기능). 대체 로딩 방식(Google Fonts CDN link vs `@fontsource` 패키지 vs 시스템 폰트)은 `book-search-app.md` Step 1.5에서 PAAR로 결정 예정 [2026-07-08].

### 스케일 (Figma "Style" 컴포넌트, node `753:96` REST API 재검증 완료 — 2026-07-08)

| 토큰 | size/weight/lh | 실사용 예 |
|---|---|---|
| `title1` | 24px / 700 / lh 24 | 로고 CERTICOS BOOKS |
| `title2` | 22px / 700 / lh 24 | 페이지 섹션 제목 |
| `title3` | 18px / 700 / lh 18 | 책 제목·가격 (아코디언 컨텍스트만 lh 26 오버라이드) |
| `body1` | 20px / 500 / lh 20 | GNB 탭 |
| `body2` | 14px / 500 / lh 14 | 저자명, 상세검색·검색하기 버튼 |
| `body2-bold` | 14px / 700 / lh 14 | 팝업 셀렉트 값, 책 소개 라벨 |
| `caption` | 16px / 500 / lh 16 | placeholder, 구매하기·상세보기 버튼, 카운트 텍스트(총 N건은 400) |
| `small` | 10px / 500 / lh 10 | 원가·할인가 라벨 |

특이 사항 (Figma 원본 그대로):
- 원가(16,000원 취소선): 18px / **weight 350** — Noto Sans KR 350은 웹폰트 미제공 → **300으로 구현** (시각 차 미미, 근거 기록)
- 책 소개 본문: `small`(10px/500) 사용하되 해당 위치만 **lh 16 오버라이드** — base 스타일의 lh 10과 다름(가독성 목적 인스턴스 오버라이드로 추정). 접근성 관점 우려는 리뷰 단계에서 사용자와 재확인

## 3. 형태·간격 (Figma 노드 실측)

**radius는 전역 토큰이 아니다**: Style 레이어(node `753:96`)는 Color·Typography만 정의하고 Radius 섹션이 없다 — 아래 8px/100px는 개별 컴포넌트 인스턴스 실측값. §1 "비-토큰 색"과 동일 원칙으로, radius도 전역 `@theme`에 넣지 않고 Phase 3에서 해당 컴포넌트(Button/Input/Popover)에 귀속시킨다(`rounded-[8px]`/`rounded-[100px]` 등).

| 항목 | 값 |
|---|---|
| radius: 버튼·팝업·상세보기 | **8px** |
| radius: 검색 인풋(pill) | **100px** |
| 검색 인풋 | 480×50, fill `light-gray` |
| 상세검색 버튼 | 72×35, stroke `#8D94A0` 1px, radius 8 |
| 리스트 아이템 | 960×100, 하단 구분선 `#D2D6DA` 1px(비-토큰, 위 §1 참조) |
| 리스트 썸네일 | 48×68 (하트 오버레이 16×16) |
| 아코디언 아이템 | 960×344, 썸네일 210×280 (하트 24×24) |
| 버튼(구매/상세보기) | 115×48 (아코디언 구매하기 240×48), pad 20×13 |
| 상세검색 팝업 | 360×160, radius 8, white + shadow |
| 팝업 내부 | 셀렉트 100×36 / 인풋 208×36 (underline 1px, 활성 `primary`·비활성 `#D2D6DA`) / 검색하기 312×36 |
| Header | 높이 80, 콘텐츠 폭 960 중앙 |
| 하트 아이콘 | 24×24 (fill `red` / line `gray`) |
| 간격 그리드 | 8·10·11·16px 관찰 → **4px 배수** 원칙 |

## 4. Tailwind v4 `@theme` 매핑

```css
@theme {
  --color-primary: #4880ee;
  --color-red: #e84118;
  --color-gray: #dadada;
  --color-light-gray: #f2f4f6;
  --color-white: #ffffff;
  --color-black: #222222;
  --color-text-primary: #353c49;
  --color-text-secondary: #6d7582;
  --color-text-subtitle: #8d94a0;

  --font-sans: "Noto Sans KR", sans-serif;
}
```

radius(8px/100px)는 위 §3 원칙에 따라 이 매핑에 포함하지 않는다 — Phase 3 컴포넌트에서 직접 적용.

- 타이포는 `@utility title1 { ... }` 형태로 size+weight+lh 결합 유틸 8종 정의(Figma 텍스트 스타일명과 1:1 매칭, `font-` 접두사 없음) — 임의 `text-[..px]` 금지
- 하트 아이콘(채움 `red`/미채움 `gray`)은 SVG 컴포넌트로 재작성, 상태별 색은 토큰(`text-red`/`text-gray`) 참조 — "찜 여부" 같은 의미 네이밍(`like`/`like-off`)은 컴포넌트 스코프에서만 사용하고 전역 토큰명에는 반영하지 않는다(Figma 원본 토큰명 1:1 유지)
