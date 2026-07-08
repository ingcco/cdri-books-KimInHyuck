import { createContext, useCallback, useContext, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";

const FAVORITES_PAGE_SIZE = 10;

type FavoritesPageContextValue = ReturnType<typeof useFavoritesPage>;

const FavoritesPageContext = createContext<FavoritesPageContextValue | null>(null);

const useFavoritesPageContext = () => {
  const ctx = useContext(FavoritesPageContext);
  if (!ctx) throw new Error("FavoritesPageContext를 Provider 안에서 사용하세요");
  return ctx;
};

const useFavoritesPage = () => {
  const { favorites, favoriteHandler } = useFavorites();

  // 클라 페이지네이션 — 10개씩 노출, sentinel 도달 시 증가
  const [visibleCount, setVisibleCount] = useState(FAVORITES_PAGE_SIZE);

  // 아코디언 단일 열림 — 열린 항목의 isbn 하나만 보관
  const [openIsbn, setOpenIsbn] = useState<string | null>(null);

  const result = {
    books: favorites.slice(0, visibleCount),
    totalCount: favorites.length,
    isEmpty: favorites.length === 0,
    hasMore: visibleCount < favorites.length,
    // useBookListVirtualizer effect deps 안정화를 위해 useCallback (react.md 허용 조건)
    loadMore: useCallback(() => setVisibleCount((count) => count + FAVORITES_PAGE_SIZE), []),
    openIsbn,
    toggleOpen: (isbn: string) => setOpenIsbn((cur) => (cur === isbn ? null : isbn)),
    favorite: favoriteHandler,
  };

  return { result };
};

export { useFavoritesPage, FavoritesPageContext, useFavoritesPageContext };
