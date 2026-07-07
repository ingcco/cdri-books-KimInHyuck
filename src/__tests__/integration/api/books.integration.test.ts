import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { getBookList } from "../../../lib/api/books/api";
import { server } from "../msw/server";

const BOOK_SEARCH_URL = "https://dapi.kakao.com/v3/search/book";

describe("getBookList", () => {
  it("성공 — documents/meta를 그대로 반환한다", async () => {
    server.use(
      http.get(BOOK_SEARCH_URL, () =>
        HttpResponse.json({
          documents: [
            {
              title: "이펙티브 타입스크립트",
              contents: "...",
              url: "https://book.daum.net/detail/book.do?bookid=1",
              isbn: "1111111111",
              datetime: "2020-01-01T00:00:00.000+09:00",
              authors: ["댄 밴더캄"],
              publisher: "인사이트",
              translators: ["장原"],
              price: 30000,
              sale_price: 27000,
              thumbnail: "https://example.com/thumb.jpg",
              status: "정상판매",
            },
          ],
          meta: { total_count: 1, pageable_count: 1, is_end: true },
        })
      )
    );

    const result = await getBookList({ query: "타입스크립트" });

    expect(result.documents).toHaveLength(1);
    expect(result.documents[0]?.title).toBe("이펙티브 타입스크립트");
    expect(result.meta.is_end).toBe(true);
  });

  it("빈 결과 — documents 빈 배열", async () => {
    server.use(
      http.get(BOOK_SEARCH_URL, () =>
        HttpResponse.json({
          documents: [],
          meta: { total_count: 0, pageable_count: 0, is_end: true },
        })
      )
    );

    const result = await getBookList({ query: "존재하지않는검색어xyz" });

    expect(result.documents).toHaveLength(0);
    expect(result.meta.total_count).toBe(0);
  });

  it("target 파라미터가 쿼리스트링에 그대로 전달된다", async () => {
    let capturedTarget: string | null = null;
    server.use(
      http.get(BOOK_SEARCH_URL, ({ request }) => {
        capturedTarget = new URL(request.url).searchParams.get("target");
        return HttpResponse.json({
          documents: [],
          meta: { total_count: 0, pageable_count: 0, is_end: true },
        });
      })
    );

    await getBookList({ query: "타입스크립트", target: "title" });

    expect(capturedTarget).toBe("title");
  });

  it.each([400, 401, 503, 500])("HTTP %d 응답은 에러로 reject된다", async (status) => {
    server.use(http.get(BOOK_SEARCH_URL, () => new HttpResponse(null, { status })));

    await expect(getBookList({ query: "타입스크립트" })).rejects.toMatchObject({
      response: { status },
    });
  });
});
