import { test, expect } from "@playwright/test";
import { makeBooks, mockBookApi } from "./fixtures";

// 검색 UX 후속(F-11~14) 동작 검증 — 네이티브 type=search 동작/스크롤/blur은 jsdom 단위테스트로
// 재현 불가라 실제 브라우저(Playwright)로 확인한다.
test.describe("검색 UX 동작", () => {
  test.beforeEach(async ({ page }) => {
    await mockBookApi(page, { documents: makeBooks(20), totalCount: 20, isEnd: true });
  });

  test("#2 새 검색을 실행하면 결과 스크롤이 top으로 초기화된다", async ({ page }) => {
    await page.goto("/?q=검색어1");

    const list = page.locator("ul").first();
    await expect(list).toBeVisible();
    const scrollArea = list.locator("xpath=..");

    // 아래로 스크롤
    await scrollArea.evaluate((el) => el.scrollTo(0, 800));
    await expect.poll(() => scrollArea.evaluate((el) => el.scrollTop)).toBeGreaterThan(400);

    // 인풋에서 새 검색어로 재검색(클라이언트 내비 — 리로드 아님)
    const input = page.getByRole("searchbox", { name: "검색어" });
    await input.click();
    await input.fill("검색어2");
    await input.press("Enter");
    await expect(page).toHaveURL(/q=%EA%B2%80%EC%83%89%EC%96%B42|q=검색어2/);

    // 스크롤이 top으로 초기화
    await expect.poll(() => scrollArea.evaluate((el) => el.scrollTop)).toBeLessThan(5);
  });

  test("#1 Enter로 검색 실행 시 히스토리 popover가 닫힌다", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("search-history", JSON.stringify(["리액트", "타입스크립트"]));
    });
    await page.goto("/");

    const input = page.getByRole("searchbox", { name: "검색어" });
    await input.click(); // focus → 히스토리 popover 표시
    const historyItem = page.getByRole("button", { name: "리액트", exact: true });
    await expect(historyItem).toBeVisible();

    await input.fill("무라카미");
    await input.press("Enter");

    // popover 닫힘 + 검색 실행됨
    await expect(historyItem).toBeHidden();
    await expect(page.getByText("도서 검색 결과")).toBeVisible();
  });

  test("#3 Esc는 popover만 닫고 input 값은 보존한다", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("search-history", JSON.stringify(["리액트"]));
    });
    await page.goto("/");

    const input = page.getByRole("searchbox", { name: "검색어" });
    await input.click();
    await input.fill("무라카미");
    await expect(input).toHaveValue("무라카미");

    const historyItem = page.getByRole("button", { name: "리액트", exact: true });
    await expect(historyItem).toBeVisible();

    await input.press("Escape");

    // 값 보존(네이티브 삭제 차단) + popover 닫힘
    await expect(input).toHaveValue("무라카미");
    await expect(historyItem).toBeHidden();
  });

  test("#4 값이 있을 때 close.svg clear 버튼이 뜨고, 클릭하면 값이 비워진다", async ({ page }) => {
    await page.goto("/");

    const input = page.getByRole("searchbox", { name: "검색어" });
    const clearBtn = page.getByRole("button", { name: "검색어 지우기" });

    // 비어있을 땐 clear 버튼 없음
    await expect(clearBtn).toHaveCount(0);

    await input.click();
    await input.fill("무라카미");
    await expect(clearBtn).toBeVisible();
    // 커스텀 close.svg 아이콘(네이티브 X 아님)
    await expect(clearBtn.locator("svg")).toBeVisible();

    await clearBtn.click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
    await expect(clearBtn).toHaveCount(0);
  });

  test("#5 로고 클릭 시 홈으로 이동하며 입력 검색어가 비워진다", async ({ page }) => {
    await page.goto("/?q=무라카미");
    const input = page.getByRole("searchbox", { name: "검색어" });
    await expect(input).toHaveValue("무라카미");

    await page.getByRole("link", { name: "CERTICOS BOOKS" }).click();

    await expect(input).toHaveValue("");
  });
});
