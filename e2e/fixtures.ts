import { expect, type Locator, type Page } from "@playwright/test";

// ============================================================
// Figma 실측 상수 (screens.md "실측 정합 SOT" 1:1) — 정합 기준의 SOT
// ============================================================
export const RGB = {
  primary: "rgb(72, 128, 238)", // #4880EE
  textPrimary: "rgb(53, 60, 73)", // #353C49
  textSecondary: "rgb(109, 117, 130)", // #6D7582
  textSubtitle: "rgb(141, 148, 160)", // #8D94A0
  lightGray: "rgb(242, 244, 246)", // #F2F4F6
  black: "rgb(34, 34, 34)", // #222222
  titleBlack: "rgb(26, 30, 39)", // #1A1E27
  divider: "rgb(210, 214, 218)", // #D2D6DA
} as const;

export const SPEC = {
  header: { logoX: 160, tabGap: 56, tabFontSize: 20, tabFontWeight: 500, underlineH: 1 },
  search: {
    pillH: 50,
    iconSize: 30,
    detailBtn: { w: 72, h: 35 },
    inputGap: 16, // 인풋→상세버튼
    countLabelSize: 16,
  },
  h1: { fontSize: 22, fontWeight: 700 },
  itemCollapsed: {
    height: 100,
    padLeft: 48,
    thumb: { w: 48, h: 68 },
    gapThumbToTitle: 48,
    buyBtn: { w: 115, h: 48 },
    detailBtn: { w: 115, h: 48 },
    buttonGap: 8,
  },
  empty: { iconSize: 80, gap: 24 },
} as const;

// ============================================================
// 도서 mock — 카카오 검색 응답 { documents, meta } 재현 + CORS(preflight 포함)
// ============================================================
export interface MockBook {
  title: string;
  contents: string;
  url: string;
  isbn: string;
  datetime: string;
  authors: string[];
  publisher: string;
  translators: string[];
  price: number;
  sale_price: number;
  thumbnail: string;
  status: string;
}

export const makeBooks = (n: number): MockBook[] =>
  Array.from({ length: n }, (_, i) => ({
    title: `무라카미 하루키 도서 ${i + 1}`,
    contents: "책 소개 본문입니다. ".repeat(12),
    url: "https://search.daum.net/search",
    isbn: `ISBN-${i + 1}`,
    datetime: "2024-01-01T00:00:00.000+09:00",
    authors: ["무라카미 하루키"],
    publisher: "민음사",
    translators: [],
    price: 16000,
    sale_price: 13500,
    thumbnail: "",
    status: "정상판매",
  }));

// 하트/이미지 없는 결정적 데이터 — 이미지 미로드로 인한 지연 회피(thumbnail "" → placeholder box)
export const mockBookApi = async (
  page: Page,
  opts: { documents: MockBook[]; totalCount?: number; isEnd?: boolean }
) => {
  const { documents, totalCount = documents.length, isEnd = true } = opts;
  const cors = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,OPTIONS",
    "access-control-allow-headers": "authorization,ka,content-type",
  };
  await page.route(
    (url) => url.hostname === "dapi.kakao.com",
    async (route) => {
      if (route.request().method() === "OPTIONS") {
        return route.fulfill({ status: 204, headers: cors });
      }
      return route.fulfill({
        status: 200,
        headers: { ...cors, "content-type": "application/json" },
        body: JSON.stringify({
          documents,
          meta: { total_count: totalCount, pageable_count: totalCount, is_end: isEnd },
        }),
      });
    }
  );
};

export const seedFavorites = async (page: Page, books: MockBook[]) => {
  await page.addInitScript((data) => {
    window.localStorage.setItem("favorites", data);
  }, JSON.stringify(books));
};

// ============================================================
// 측정 헬퍼
// ============================================================
export const box = async (locator: Locator) => {
  const b = await locator.boundingBox();
  if (!b) throw new Error("boundingBox 없음(미렌더)");
  return b;
};

export const css = (locator: Locator, prop: string) =>
  locator.evaluate((el, p) => getComputedStyle(el).getPropertyValue(p), prop);

// ±tol px 근사 비교
export const near = (actual: number, expected: number, tol = 2) => {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} ≈ ${expected} (±${tol})`
  ).toBeLessThanOrEqual(tol);
};
