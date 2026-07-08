# 컴포넌트 설계 — certicos Books

> 출처: **Figma REST API 실측**. 디자이너가 Figma에 정의한 컴포넌트가 6종 존재하며(Header, NoData, SearchCountText, BookListItem, BookListItemDetail, SearchBox + 아이콘 like/fill·like/line), **구현 컴포넌트를 이와 1:1 매핑**한다 — "재사용 가능한 컴포넌트 설계" 평가 기준에 대한 가장 강한 근거는 디자인 명세와의 대응이다.
> 원칙: 공용 컴포넌트(`components/`)는 도메인 무지, 도메인 조립은 페이지 슬라이스에서.

## 1. Figma 컴포넌트 ↔ 구현 매핑

| Figma 컴포넌트 | 구현 | 실측 스펙 |
|---|---|---|
| `Header` | `components/Header` | 1920×80, 로고 title1, 탭 body1, 활성 언더라인 `primary` |
| `SearchBox` | `books/SearchBar` | 인풋 480×50 pill(`light-gray`) + 상세검색 버튼 72×35(stroke `#8D94A0`, r8) |
| `SearchCountText` | `components/ResultCount` | "찜한 책 · 총 N건", gap 16, N만 `primary` |
| `BookListItem` | `book/BookListItem` (collapsed) | 960×100, 썸네일 48×68+하트 16, divider 1px |
| `BookListItemDetail` | `book/BookListItem` (expanded) | 960×344, 썸네일 210×280+하트 24 |
| `NoData` | `components/EmptyState` | 원형 아이콘 + 문구(선택) |
| `like/fill`·`like/line` | `components/LikeButton` (SVG) | 24×24, fill `#E84118` / line `#DADADA` |
| (팝업 그룹 `pop`) | `books/DetailSearchPopover` | 360×160, r8, 셀렉트+언더라인 인풋+검색하기 312×36 |

## 2. 공용 컴포넌트 (components/) 상세

### Button
- variants: `primary`(#4880EE fill, white 텍스트) / `outline`(stroke #8D94A0, 텍스트 subtitle — 상세검색) / `gray`(#F2F4F6 fill, 텍스트 secondary — 상세보기)
- sizes: `sm`(72×35, body2) / `md`(115×48, caption) / `lg`(240×48) / 팝업용 full-width 36
- radius 8 공통. `ComponentProps<"button">` 확장 + tv() variants + 우측 아이콘 슬롯(chevron)

### Input
- pill(radius 100, `light-gray` 배경, 좌측 검색 아이콘), placeholder `text-subtitle` 16
- 입력 텍스트 `#222222`. `type="search"`, label 시각숨김
- 팝업용 underline variant: 하단 1px (`divider`, focus 시 `primary`)

### Dropdown
- 네이티브 `<select>` 대신 자체 구현(vxt-fashion-admin 참고 — WAI-ARIA APG "select-only combobox" 패턴: `role="combobox"` trigger + `aria-activedescendant` + `role="listbox"`/`role="option"`). 옵션: 제목/저자명/출판사(도메인 리스트는 `constants/dropdownList.ts`에서 주입, Dropdown 자체는 도메인 무지)
- vxt와 동일하게 **compound(`Dropdown.Trigger`/`.Content`/`.Item`) + flat(`list`/`value`/`onChange`) 둘 다 지원** — Root가 `list` prop 유무로 내부 분기(있으면 Trigger+Content+Item 자동 조립, 없으면 `children` compound 렌더). vxt의 `SearchInput`/`Checkbox`/`CheckboxGroup`/`Group`/`Label`/`Separator`/`Empty`는 지금 화면에 다중선택·검색필터·그룹 요구가 없어 제외(2026-07-08)
- 키보드 이동은 vxt와 동일하게 DOM(`[role="option"]`) 순서 기준 — Root가 compound 자식 목록을 미리 알 수 없어도 동작하게 하기 위함(compound 모드 지원의 핵심 전제)
- 값 텍스트 body2-bold. underline 1px(`#D2D6DA`, 비-토큰), 커스텀 chevron(`#B1B8C0`, 비-토큰, 열림 시 회전, Figma 벡터 `chevron-down.svg`)
- 2026-07-08: `react.md`/`conventions.md`가 이미 "Dropdown"으로 명명해온 것과 일치시킴(기존 Figma 주석의 "Select" 표기와 달랐던 부분 정정)

### Popover
- anchor 하단, 360×160, r8, shadow, 우상단 X(`icon`)
- 외부 클릭/Esc 닫힘, 포커스 트랩, `role="dialog"` + `aria-label`

### LikeButton
- 24×24 SVG 하트 토글: fill `#E84118` / line `#DADAda` — Figma 벡터 재작성
- `<button aria-pressed>` + 시각숨김 라벨 "찜하기". 썸네일 우상단 오버레이(리스트 16, 아코디언 24)

### EmptyState
- 원형 아이콘(80) + 문구 caption `text-secondary`. 문구: "검색된 결과가 없습니다." / "찜한 책이 없습니다."

### Skeleton *(디자인 미명시 → 지원자 판단: 로딩 UX·CLS 방지 근거)*
- BookListItem 형태 스켈레톤. 무한 스크롤 후속 페이지 로딩에도 사용

## 3. 도메인 컴포넌트

### BookListItem — 핵심 (collapsed ↔ expanded 아코디언)
- **collapsed** (960×100): 썸네일 48×68(+하트16) | 제목 title3 + 저자 body2 `secondary` (gap 16) | 최종가 title3 | 구매하기 md + 상세보기 gray(chevron▼)
- **expanded** (960×344): 썸네일 210×280(+하트24) | 제목 title3(lh26) + 저자 body2 `subtitle` | 책 소개(라벨 body2-bold + 본문 small/lh16) | 우측: 원가(small 라벨 + 18px/300 취소선) · 할인가(small 라벨 + title3) | 구매하기 240×48 + 상세보기(▲)
- 가격 규칙: collapsed 최종가 = `sale_price ≥ 0 ? sale_price : price`; expanded는 원가+할인가 병기, **할인가 없으면(-1) 미노출** (Figma 주석)
- 구매하기 → 새 탭 `url`(다음 책), `rel="noopener noreferrer"`
- 아코디언 높이 트랜지션 (미명시 → 판단)

### SearchBar (인풋 + 검색 기록 + 상세검색)
- Enter 검색 실행. focus 시 검색 기록 리스트 확장(인풋 하단, `light-gray` 연장 형태)
- 기록: 항목 클릭=재검색, X(`icon`)=개별 삭제, **최대 8개·오래된 순 삭제·재시작 후 유지**(localStorage)

## 4. 구성 트리

```
app/
├─ components/                   # 공용 (도메인 무지, ui/layout 서브폴더 없이 바로 둠 — page.md 규약)
│  ├─ button/ input/ input/search/ popover/
│  ├─ dropdown/                  # compound: components/{Trigger,Content,Item}.tsx + hooks/useDropdown.ts
│  ├─ likebutton/ emptystate/ skeleton/ resultcount/ header/ toast/ modal/
├─ book/ (공유 도메인 컴포넌트)  # BookList, BookListItem — 검색·찜 2페이지 공유
├─ page.tsx                     # 도서 검색: hooks/useBookSearch + SearchBar, DetailSearchPopover
└─ favorites/page.tsx           # 내가 찜한 책: hooks/useFavorites (BookList 재사용)
```

> BookList/BookListItem 승격 근거: 검색·찜 2페이지 + 테스트 3곳 사용 ("3곳 미만 인라인" 원칙 충족).
