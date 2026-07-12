import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useFavorites } from "@/lib/favorites/useFavorites";

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

  const [visibleCount, setVisibleCount] = useState(FAVORITES_PAGE_SIZE);

  const [openIsbn, setOpenIsbn] = useState<string | null>(null);

  const result = {
    books: useMemo(() => favorites.slice(0, visibleCount), [favorites, visibleCount]),
    totalCount: favorites.length,
    isEmpty: favorites.length === 0,
    hasMore: visibleCount < favorites.length,
    loadMore: useCallback(() => setVisibleCount((count) => count + FAVORITES_PAGE_SIZE), []),
    openIsbn,
    toggleOpen: (isbn: string) => setOpenIsbn((cur) => (cur === isbn ? null : isbn)),
    favorite: favoriteHandler,
  };

  return { result };
};

export { useFavoritesPage, FavoritesPageContext, useFavoritesPageContext };
