/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { useBookListInfiniteQuery } from "../../../lib/api/books/api.queries";
import { server } from "../msw/server";

const BOOK_SEARCH_URL = "https://dapi.kakao.com/v3/search/book";

const book = (title: string) => ({
  title,
  contents: "...",
  url: "https://book.daum.net/detail/book.do?bookid=1",
  isbn: "1111111111",
  datetime: "2020-01-01T00:00:00.000+09:00",
  authors: ["저자"],
  publisher: "출판사",
  translators: [],
  price: 10000,
  sale_price: 9000,
  thumbnail: "https://example.com/thumb.jpg",
  status: "정상판매",
});

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe("useBookListInfiniteQuery", () => {
  it("빈 검색어는 요청하지 않는다(enabled 게이트)", async () => {
    const { result } = renderHook(() => useBookListInfiniteQuery({ query: "  " }), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("페이지가 쌓이고, is_end=true 이후로는 추가 요청을 보내지 않는다", async () => {
    let requestCount = 0;

    server.use(
      http.get(BOOK_SEARCH_URL, ({ request }) => {
        requestCount += 1;
        const page = new URL(request.url).searchParams.get("page");
        if (page === "2") {
          return HttpResponse.json({
            documents: [book("두번째 페이지 책")],
            meta: { total_count: 2, pageable_count: 2, is_end: true },
          });
        }
        return HttpResponse.json({
          documents: [book("첫번째 페이지 책")],
          meta: { total_count: 2, pageable_count: 2, is_end: false },
        });
      })
    );

    const { result } = renderHook(() => useBookListInfiniteQuery({ query: "타입스크립트" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.documents).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);
    expect(requestCount).toBe(1);

    await result.current.fetchNextPage();
    await waitFor(() => expect(result.current.data?.documents).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(false);
    expect(requestCount).toBe(2);

    await result.current.fetchNextPage();
    expect(requestCount).toBe(2);
  });
});
