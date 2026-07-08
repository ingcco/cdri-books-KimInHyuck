import { useState } from "react";
import { LOCAL_STORAGE_KEY } from "@/constants/localStorageKey";
import type { BookData } from "@/lib/api/books/api.interface";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

// 찜 목록 상태 훅 — 하트 클릭 시점의 도서 스냅샷을 localStorage에 유지(토글).
const useFavorites = () => {
  const [favorites, setFavorites] = useState<BookData[]>(() =>
    getLocalStorage<BookData[]>(LOCAL_STORAGE_KEY.FAVORITES, [])
  );

  const favoriteHandler = {
    isFavorite: (isbn: string) => favorites.some((book) => book.isbn === isbn),
    toggle: (book: BookData) => {
      const exists = favorites.some((item) => item.isbn === book.isbn);
      const next = exists
        ? favorites.filter((item) => item.isbn !== book.isbn)
        : [book, ...favorites];
      setFavorites(next);
      setLocalStorage(LOCAL_STORAGE_KEY.FAVORITES, next);
    },
  };

  return { favorites, favoriteHandler };
};

export { useFavorites };
