import { useState } from "react";
import { LOCAL_STORAGE_KEY } from "@/constants/localStorageKey";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

// 찜 스냅샷 DTO — 카카오엔 찜/상세조회 API가 없어(검색 단일 엔드포인트) 하트 클릭 시점의
// 도서 데이터를 저장한다. 찜 화면이 렌더하는 필드만 큐레이션한 도메인 타입.
export interface FavoriteBook {
  isbn: string;
  title: string;
  contents: string;
  url: string;
  authors: string[];
  price: number;
  sale_price: number;
  thumbnail: string;
}

// 검색 결과(BookData)가 넘어와도 찜에 필요한 필드만 스냅샷으로 남긴다(런타임 필드 정리).
// BookData는 FavoriteBook의 구조적 상위 타입이라 그대로 받는다.
const toFavoriteBook = (book: FavoriteBook): FavoriteBook => ({
  isbn: book.isbn,
  title: book.title,
  contents: book.contents,
  url: book.url,
  authors: book.authors,
  price: book.price,
  sale_price: book.sale_price,
  thumbnail: book.thumbnail,
});

// 찜 목록 상태 훅 — 클릭 시점 스냅샷을 localStorage에 유지(토글). 홈 하트·찜 페이지 공유 SOT.
const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteBook[]>(() =>
    getLocalStorage<FavoriteBook[]>(LOCAL_STORAGE_KEY.FAVORITES, [])
  );

  const favoriteHandler = {
    isFavorite: (isbn: string) => favorites.some((book) => book.isbn === isbn),
    toggle: (book: FavoriteBook) => {
      const exists = favorites.some((item) => item.isbn === book.isbn);
      const next = exists
        ? favorites.filter((item) => item.isbn !== book.isbn)
        : [toFavoriteBook(book), ...favorites];
      setFavorites(next);
      setLocalStorage(LOCAL_STORAGE_KEY.FAVORITES, next);
    },
  };

  return { favorites, favoriteHandler };
};

export { useFavorites };
