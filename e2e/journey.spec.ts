import { test, expect } from "@playwright/test";
import { makeBooks, mockBookApi } from "./fixtures";

// 시각 정합(home/favorites.spec)과 별도 트랙 — 기능 여정·상호배타·접근성 행동을 검증한다.
test.describe("검색 기능 여정", () => {
  test.beforeEach(async ({ page }) => {
    await mockBookApi(page, { documents: makeBooks(3), totalCount: 3 });
  });

  test("검색 → 결과 → 하트 찜 → 찜 페이지에 스냅샷 유지 (AC 1.1·2.3·4.2)", async ({ page }) => {
    await page.goto("/?q=무라카미");

    const firstItem = page.locator("ul li").first();
    await expect(firstItem.getByRole("heading", { level: 3 })).toHaveText("무라카미 하루키 도서 1");

    // 하트 토글 — 상태를 색이 아니라 aria-pressed·라벨로 노출(접근성 계약)
    const heart = firstItem.getByRole("button", { name: /찜/ });
    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await expect(heart).toHaveAttribute("aria-label", "찜하기");

    await heart.click();
    await expect(heart).toHaveAttribute("aria-pressed", "true");
    await expect(heart).toHaveAttribute("aria-label", "찜 해제");

    // 찜 페이지로 이동 → 클릭 시점 스냅샷이 유지된다(재방문 유지)
    await page.goto("/favorites");
    await expect(
      page.getByRole("heading", { level: 3, name: "무라카미 하루키 도서 1" })
    ).toBeVisible();
    const count = page.locator("p", { hasText: "총" }).locator(".text-primary");
    await expect(count).toHaveText("1");
  });

  test("상호배타 — 상세검색 시 통합 입력 비움 / 통합검색 시 상세 조건 초기화 (AC 3.4)", async ({
    page,
  }) => {
    await page.goto("/?q=무라카미");

    // searchbox role — getByLabel("검색어")은 clear 버튼("검색어 지우기")까지 substring 매칭돼 2개가 잡힌다
    const mainInput = page.getByRole("searchbox", { name: "검색어" });
    await expect(mainInput).toHaveValue("무라카미");

    // 상세검색 실행(기본 target=제목) → 통합 입력이 비워지고 URL에 target 지정
    await page.getByRole("button", { name: "상세검색" }).click();
    const dialog = page.getByRole("dialog", { name: "상세 검색" });
    await expect(dialog).toBeVisible();
    await dialog.getByPlaceholder("검색어 입력").fill("하루키");
    await dialog.getByRole("button", { name: "검색하기" }).click();

    await expect(dialog).toBeHidden();
    await expect(mainInput).toHaveValue("");
    await expect(page).toHaveURL(/target=title/);

    // 통합검색 실행 → 상세 조건(target)이 초기화된다
    await mainInput.fill("무라카미");
    await mainInput.press("Enter");
    await expect(page).toHaveURL(/[?&]q=/);
    await expect(page).not.toHaveURL(/target=/);
  });

  test("접근성 — 상세검색 팝오버가 닫기 버튼으로 닫힌다 (role=dialog·dismissible, 7-9)", async ({
    page,
  }) => {
    await page.goto("/?q=무라카미");

    await page.getByRole("button", { name: "상세검색" }).click();
    const dialog = page.getByRole("dialog", { name: "상세 검색" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "상세 검색 닫기" }).click();
    await expect(dialog).toBeHidden();
  });
});
