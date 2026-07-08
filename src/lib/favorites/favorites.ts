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

export const readFavorites = () => getLocalStorage<FavoriteBook[]>(LOCAL_STORAGE_KEY.FAVORITES, []);

export const writeFavorites = (list: FavoriteBook[]) =>
  setLocalStorage(LOCAL_STORAGE_KEY.FAVORITES, list);

export const isFavorite = (list: FavoriteBook[], isbn: string) =>
  list.some((book) => book.isbn === isbn);

// 있으면 제거, 없으면 스냅샷을 맨 앞에 추가한 새 배열을 반환한다(순수 — 입력→출력).
export const toggleFavorite = (list: FavoriteBook[], book: FavoriteBook): FavoriteBook[] =>
  isFavorite(list, book.isbn)
    ? list.filter((item) => item.isbn !== book.isbn)
    : [toFavoriteBook(book), ...list];
