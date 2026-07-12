import {
  keepPreviousData,
  useInfiniteQuery,
  type QueryKey,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { bookKeys } from "../shared/queryKeys";
import type { Response } from "../shared/response";
import { getBookList } from "./api";
import type { BookData, BookListParams } from "./api.interface";

export const PAGE_SIZE = 10;

export interface BookListResult {
  documents: BookData[];
  meta: Response<BookData>["meta"];
}

export const EMPTY_BOOK_LIST: BookListResult = {
  documents: [],
  meta: { total_count: 0, pageable_count: 0, is_end: true },
};

type BookListQueryParams = Omit<BookListParams, "page">;

export const useBookListInfiniteQuery = <TData = BookListResult>(
  params: BookListQueryParams,
  options?: Omit<
    UseInfiniteQueryOptions<Response<BookData>, Error, TData, QueryKey, number>,
    "queryKey" | "queryFn"
  >
) =>
  useInfiniteQuery({
    queryKey: bookKeys.list(params),
    queryFn: ({ pageParam }) => getBookList({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.meta.is_end ? undefined : allPages.length + 1,
    select: (data) =>
      ({
        documents: data.pages.flatMap((page) => page.documents),
        meta: data.pages.at(-1)?.meta ?? EMPTY_BOOK_LIST.meta,
      }) as TData,
    placeholderData: keepPreviousData,
    enabled: params.query.trim().length > 0,
    meta: { errorMessage: "검색 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요." },
    ...options,
  });
