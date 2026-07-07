# 디자인 토큰 — certicos Books

> 출처(정확도 순): ① **Figma REST API 실측** (파일 `VHM0w7IBWLaaCJp0l9Mkff`, lastModified 2024-10-02) ② Figma export PNG 픽셀 샘플링 ③ 화면 관찰.
> 아래 값은 전부 ①에서 추출한 노드 원본 값이며, ②로 교차 검증됨.

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

### 파생 색 (Style 프레임 미정의, 실사용 노드에서 추출)

| 토큰 | Hex | 용도 |
|---|---|---|
| `icon` | `#B1B8C0` | chevron·닫기 아이콘 |
| `divider` | `#D2D6DA` | 리스트 구분선(1px), 팝업 비활성 언더라인 |
| `title-black` | `#1A1E27` | 페이지 섹션 제목(도서 검색) |

접근성(WCAG 대비, white 배경): `text-primary` 10.9:1 ✅ · `text-secondary` 5.0:1 ✅ · `text-subtitle` 3.5:1(보조 전용) · `primary` 위 white 텍스트 3.9:1 → 버튼 텍스트는 16px/500이므로 AA large text(3:1) 통과, 단 focus ring 등으로 보완.

## 2. 타이포그래피

폰트: **Noto Sans KR** (Figma 실측 — 전 UI 노드 공통). `next/font/google` 서브셋 로드(외부 요청 0, CLS 0).

### 스케일 (Style 프레임 정의 ↔ 실사용 대조)

| 토큰 | size/weight | 실사용 예 |
|---|---|---|
| `title1` | 24px / 700 | 로고 CERTICOS BOOKS |
| `title2` | 22px / 700 | 페이지 섹션 제목 (lh 24) |
| `title3` | 18px / 700 | 책 제목·가격 (리스트 lh 18, 아코디언 lh 26) |
| `body1` | 20px / 500 | GNB 탭 |
| `body2` | 14px / 500 | 저자명, 상세검색·검색하기 버튼 |
| `body2-bold` | 14px / 700 | 팝업 셀렉트 값, 책 소개 라벨 |
| `caption` | 16px / 500 | placeholder, 구매하기·상세보기 버튼, 카운트 텍스트(총 N건은 400) |
| `small` | 10px / 500 | 원가·할인가 라벨, 책 소개 본문(lh 16) |

특이 사항 (Figma 원본 그대로):
- 원가(16,000원 취소선): 18px / **weight 350** — Noto Sans KR 350은 웹폰트 미제공 → **300으로 구현** (시각 차 미미, 근거 기록)
- 책 소개 본문이 10px/500/lh16 — 디자인 원본 준수하되, 접근성 관점 우려는 리뷰 단계에서 사용자와 재확인

## 3. 형태·간격 (Figma 노드 실측)

| 항목 | 값 |
|---|---|
| radius: 버튼·팝업·상세보기 | **8px** |
| radius: 검색 인풋(pill) | **100px** |
| 검색 인풋 | 480×50, fill `light-gray` |
| 상세검색 버튼 | 72×35, stroke `#8D94A0` 1px, radius 8 |
| 리스트 아이템 | 960×100, 하단 divider `#D2D6DA` 1px |
| 리스트 썸네일 | 48×68 (하트 오버레이 16×16) |
| 아코디언 아이템 | 960×344, 썸네일 210×280 (하트 24×24) |
| 버튼(구매/상세보기) | 115×48 (아코디언 구매하기 240×48), pad 20×13 |
| 상세검색 팝업 | 360×160, radius 8, white + shadow |
| 팝업 내부 | 셀렉트 100×36 / 인풋 208×36 (underline 1px, 활성 `primary`·비활성 `divider`) / 검색하기 312×36 |
| Header | 높이 80, 콘텐츠 폭 960 중앙 |
| 하트 아이콘 | 24×24 (fill `red` / line `gray`) |
| 간격 그리드 | 8·10·11·16px 관찰 → **4px 배수** 원칙 |

## 4. Tailwind v4 `@theme` 매핑

```css
@theme {
  --color-primary: #4880ee;
  --color-like: #e84118;
  --color-like-off: #dadada;
  --color-light-gray: #f2f4f6;
  --color-input-text: #222222;
  --color-text-primary: #353c49;
  --color-text-secondary: #6d7582;
  --color-text-subtitle: #8d94a0;
  --color-icon: #b1b8c0;
  --color-divider: #d2d6da;
  --color-title-black: #1a1e27;

  --font-sans: var(--font-noto-sans-kr), sans-serif;

  --radius-button: 8px;   /* 버튼·팝업 공통 */
  --radius-pill: 100px;   /* 검색 인풋 */
}
```

- 타이포는 `@utility font-title1 { ... }` 형태로 size+weight+lh 결합 유틸 8종 정의 — 임의 `text-[..px]` 금지
- 하트 아이콘은 `like/fill`·`like/line` 벡터를 SVG 컴포넌트로 재작성 (색은 토큰 참조)
