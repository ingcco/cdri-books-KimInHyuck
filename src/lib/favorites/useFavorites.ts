import { useState } from "react";
import {
  isFavorite,
  readFavorites,
  toggleFavorite,
  writeFavorites,
  type FavoriteBook,
} from "./favorites";

const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteBook[]>(readFavorites);

  const favoriteHandler = {
    isFavorite: (isbn: string) => isFavorite(favorites, isbn),
    toggle: (book: FavoriteBook) => {
      const next = toggleFavorite(favorites, book);
      setFavorites(next);
      writeFavorites(next);
    },
  };

  return { favorites, favoriteHandler };
};

export { useFavorites };
