import { parseAsString, useQueryStates } from "nuqs";
import { createContext, useContext, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import type { SearchTarget } from "@/lib/api/books/api.interface";
import { EMPTY_BOOK_LIST, PAGE_SIZE, useBookListInfiniteQuery } from "@/lib/api/books/api.queries";

type HomeContextValue = ReturnType<typeof useHome>;

const HomeContext = createContext<HomeContextValue | null>(null);

const useHomeContext = () => {
  const ctx = useContext(HomeContext);
  if (!ctx) throw new Error("HomeContext를 Provider 안에서 사용하세요");
  return ctx;
};

const useHome = () => {
  // URL이 검색 상태의 SOT — 새로고침/뒤로가기/링크 공유에 검색어·대상 복원
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    target: parseAsString.withDefault(""),
  });

  const { history: historyList, add: addHistory, remove: removeHistory } = useSearchHistory();
  const { favoriteHandler } = useFavorites();

  const booksQuery = useBookListInfiniteQuery({
    query: filters.q,
    target: (filters.target || undefined) as SearchTarget | undefined,
    size: PAGE_SIZE,
  });
  const data = booksQuery.data ?? EMPTY_BOOK_LIST;

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<SearchTarget>("title");
  const [detailQuery, setDetailQuery] = useState("");

  // 검색 실행 — 메인은 target 초기화, 상세는 target 지정 (상호배타) + 기록 추가
  const runSearch = (query: string, target: SearchTarget | "") => {
    const trimmed = query.trim();
    if (!trimmed) return;
    void setFilters({ q: trimmed, target });
    addHistory(trimmed);
  };

  const searchBar = {
    onSearch: (query: string) => runSearch(query, ""),
    openDetail: () => setIsDetailOpen((open) => !open),
  };

  const history = {
    list: historyList,
    select: (query: string) => runSearch(query, ""),
    remove: removeHistory,
  };

  const detailSearch = {
    isOpen: isDetailOpen,
    target: detailTarget,
    query: detailQuery,
    setTarget: (target: SearchTarget) => setDetailTarget(target),
    setQuery: (query: string) => setDetailQuery(query),
    submit: () => {
      runSearch(detailQuery, detailTarget);
      setDetailQuery("");
      setIsDetailOpen(false);
    },
    close: () => setIsDetailOpen(false),
  };

  // 아코디언 단일 열림 — 열린 항목의 isbn 하나만 보관
  const [openIsbn, setOpenIsbn] = useState<string | null>(null);

  const hasBooks = data.documents.length > 0;

  const result = {
    data,
    hasBooks,
    isSearching: booksQuery.isFetching && !hasBooks,
    isEmpty: booksQuery.isFetched && !booksQuery.isFetching && !hasBooks,
    isFetched: booksQuery.isFetched,
    hasNextPage: booksQuery.hasNextPage,
    fetchNextPage: booksQuery.fetchNextPage,
    openIsbn,
    toggleOpen: (isbn: string) => setOpenIsbn((cur) => (cur === isbn ? null : isbn)),
    favorite: favoriteHandler,
  };

  return { filters, searchBar, history, detailSearch, result };
};

export { useHome, HomeContext, useHomeContext };
