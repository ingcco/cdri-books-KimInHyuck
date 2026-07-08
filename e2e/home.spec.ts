import { test, expect } from "@playwright/test";
import { RGB, SPEC, makeBooks, mockBookApi, box, css, near } from "./fixtures";

test.describe("Header 정합 (Figma 1920×1080)", () => {
  test("로고 좌측 160 · 탭 gap 56 · 탭 20/500 다크 · 언더라인 1px primary", async ({ page }) => {
    await page.goto("/");

    const logo = page.locator("header").getByText("CERTICOS BOOKS");
    near((await box(logo)).x, SPEC.header.logoX, 3);

    const tabs = page.locator("header nav a");
    const b1 = await box(tabs.nth(0));
    const b2 = await box(tabs.nth(1));
    near(b2.x - (b1.x + b1.width), SPEC.header.tabGap, 4);

    expect(await css(tabs.nth(0), "font-size")).toBe(`${SPEC.header.tabFontSize}px`);
    expect(await css(tabs.nth(0), "font-weight")).toBe(String(SPEC.header.tabFontWeight));
    // active/inactive 탭 색 동일(다크) — 구분은 언더라인만
    expect(await css(tabs.nth(0), "color")).toBe(RGB.textPrimary);
    expect(await css(tabs.nth(1), "color")).toBe(RGB.textPrimary);

    const underline = page.locator("header nav .bg-primary").first();
    near((await box(underline)).height, SPEC.header.underlineH, 1.5);
    expect(await css(underline, "background-color")).toBe(RGB.primary);
  });
});

test.describe("검색 영역 정합", () => {
  test.beforeEach(async ({ page }) => {
    await mockBookApi(page, { documents: makeBooks(10), totalCount: 21 });
  });

  test("h1 22/700 #1A1E27 · pill 50 lightgray · 아이콘 30 · 상세버튼 72×35 · 카운트 숫자 primary", async ({
    page,
  }) => {
    await page.goto("/?q=무라카미");

    const h1 = page.getByRole("heading", { name: "도서 검색", level: 1 });
    expect(await css(h1, "font-size")).toBe(`${SPEC.h1.fontSize}px`);
    expect(await css(h1, "font-weight")).toBe(String(SPEC.h1.fontWeight));
    expect(await css(h1, "color")).toBe(RGB.titleBlack);

    const input = page.getByLabel("검색어");
    const container = input.locator("xpath=..");
    near((await box(container)).height, SPEC.search.pillH, 2);
    expect(await css(container, "background-color")).toBe(RGB.lightGray);

    const icon = container.locator("svg").first();
    const ib = await box(icon);
    near(ib.width, SPEC.search.iconSize, 2);
    near(ib.height, SPEC.search.iconSize, 2);

    const detailBtn = page.getByRole("button", { name: "상세검색" });
    const db = await box(detailBtn);
    near(db.width, SPEC.search.detailBtn.w, 3);
    near(db.height, SPEC.search.detailBtn.h, 2);
    expect(await css(detailBtn, "border-top-color")).toBe(RGB.textSubtitle);

    const number = page.locator("p", { hasText: "총" }).locator(".text-primary");
    await expect(number).toHaveText("21");
    expect(await css(number, "color")).toBe(RGB.primary);
  });

  test("상세검색 팝오버 — 폭 360 · 드롭다운 borderless(underline) · 검색하기 312", async ({
    page,
  }) => {
    await page.goto("/?q=무라카미");
    await page.getByRole("button", { name: "상세검색" }).click();

    const dialog = page.getByRole("dialog", { name: "상세 검색" });
    await expect(dialog).toBeVisible();
    near((await box(dialog)).width, 360, 3);

    // 드롭다운 트리거 borderless — 하단 언더라인(1px)만, 상단/좌우 border 없음
    const trigger = dialog.getByRole("combobox");
    expect(await css(trigger, "border-bottom-width")).toBe("1px");
    expect(await css(trigger, "border-top-width")).toBe("0px");

    const submit = dialog.getByRole("button", { name: "검색하기" });
    near((await box(submit)).width, 312, 4);
  });
});

test.describe("BookListItem collapsed 정합", () => {
  test.beforeEach(async ({ page }) => {
    await mockBookApi(page, { documents: makeBooks(10), totalCount: 21 });
  });

  test("아이템 100 · pl 48 · 썸네일 48×68 · 썸네일→제목 48 · 버튼 115×48 gap 8", async ({
    page,
  }) => {
    await page.goto("/?q=무라카미");

    const firstItem = page.locator("ul li").first();
    await expect(firstItem).toBeVisible();

    const inner = firstItem.locator(".h-\\[100px\\]");
    near((await box(inner)).height, SPEC.itemCollapsed.height, 2);

    const heart = firstItem.getByRole("button", { name: /찜/ });
    const thumb = heart.locator("xpath=..");
    const tb = await box(thumb);
    near(tb.width, SPEC.itemCollapsed.thumb.w, 3);
    near(tb.height, SPEC.itemCollapsed.thumb.h, 3);

    const itemBox = await box(firstItem);
    near(tb.x - itemBox.x, SPEC.itemCollapsed.padLeft, 3);

    const title = firstItem.getByRole("heading", { level: 3 });
    near((await box(title)).x - (tb.x + tb.width), SPEC.itemCollapsed.gapThumbToTitle, 4);

    const buy = firstItem.getByRole("link", { name: "구매하기" });
    const detail = firstItem.getByRole("button", { name: "상세보기" });
    const bb = await box(buy);
    const dbb = await box(detail);
    near(bb.width, SPEC.itemCollapsed.buyBtn.w, 2);
    near(bb.height, SPEC.itemCollapsed.buyBtn.h, 2);
    near(dbb.width, SPEC.itemCollapsed.detailBtn.w, 2);
    near(dbb.height, SPEC.itemCollapsed.detailBtn.h, 2);
    near(dbb.x - (bb.x + bb.width), SPEC.itemCollapsed.buttonGap, 3);
  });
});

test.describe("EmptyState 정합", () => {
  test("빈 결과 — 아이콘 80 · 아이콘→문구 24", async ({ page }) => {
    await mockBookApi(page, { documents: [], totalCount: 0 });
    await page.goto("/?q=존재하지않는검색어zzz");

    const emptyText = page.getByText("검색된 결과가 없습니다.");
    await expect(emptyText).toBeVisible();

    const icon = emptyText.locator("xpath=preceding-sibling::img");
    const iconBox = await box(icon);
    near(iconBox.width, SPEC.empty.iconSize, 2);
    near(iconBox.height, SPEC.empty.iconSize, 2);

    const textBox = await box(emptyText);
    near(textBox.y - (iconBox.y + iconBox.height), SPEC.empty.gap, 4);
  });
});
