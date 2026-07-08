import { test, expect } from "@playwright/test";
import { RGB, SPEC, makeBooks, seedFavorites, box, css, near } from "./fixtures";

test.describe("찜 페이지 정합", () => {
  test("h1 22/700 #1A1E27 · 카운트 숫자 primary · 아이템 100(BookListItem 재사용)", async ({
    page,
  }) => {
    await seedFavorites(page, makeBooks(3));
    await page.goto("/favorites");

    const h1 = page.getByRole("heading", { name: "내가 찜한 책", level: 1 });
    expect(await css(h1, "font-size")).toBe(`${SPEC.h1.fontSize}px`);
    expect(await css(h1, "font-weight")).toBe(String(SPEC.h1.fontWeight));
    expect(await css(h1, "color")).toBe(RGB.titleBlack);

    const number = page.locator("p", { hasText: "총" }).locator(".text-primary");
    await expect(number).toHaveText("3");
    expect(await css(number, "color")).toBe(RGB.primary);

    const firstItem = page.locator("ul li").first();
    await expect(firstItem).toBeVisible();
    const inner = firstItem.locator(".h-\\[100px\\]");
    near((await box(inner)).height, SPEC.itemCollapsed.height, 2);
  });

  test("빈 찜 — 아이콘 80 · 아이콘→문구 24", async ({ page }) => {
    await page.goto("/favorites");

    const emptyText = page.getByText("찜한 책이 없습니다.");
    await expect(emptyText).toBeVisible();

    const icon = emptyText.locator("xpath=preceding-sibling::img");
    const iconBox = await box(icon);
    near(iconBox.width, SPEC.empty.iconSize, 2);

    const textBox = await box(emptyText);
    near(textBox.y - (iconBox.y + iconBox.height), SPEC.empty.gap, 4);
  });
});
