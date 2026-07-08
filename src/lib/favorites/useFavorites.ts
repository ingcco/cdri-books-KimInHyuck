import { useState } from "react";
import {
  isFavorite,
  readFavorites,
  toggleFavorite,
  writeFavorites,
  type FavoriteBook,
} from "./favorites";

// 찜 목록 상태 훅 — 클릭 시점 스냅샷을 localStorage에 유지(토글). 홈 하트·찜 페이지 공유 SOT.
// 도메인 규칙(토글·중복제거·영속)은 favorites.ts 순수 함수에 위임하고, 여기선 state 배선만 한다.
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
