import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { bookKeys } from "../shared/queryKeys";
import type { Response } from "../shared/response";
import { getBookList } from "./api";
import type { BookData, BookListParams } from "./api.interface";

const PAGE_SIZE = 10;

export const EMPTY_BOOK_LIST: Response<BookData> = {
  documents: [],
  meta: { total_count: 0, pageable_count: 0, is_end: true },
};

export const useBookListInfiniteQuery = (params: Omit<BookListParams, "page" | "size">) => {
  return useInfiniteQuery({
    queryKey: bookKeys.list(params),
    queryFn: ({ pageParam }) => getBookList({ ...params, page: pageParam, size: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.meta.is_end ? undefined : allPages.length + 1,
    select: (data) => ({
      documents: data.pages.flatMap((page) => page.documents),
      meta: data.pages.at(-1)?.meta ?? EMPTY_BOOK_LIST.meta,
    }),
    placeholderData: keepPreviousData,
    enabled: params.query.trim().length > 0,
  });
};
