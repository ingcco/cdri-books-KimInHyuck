import { LOCAL_STORAGE_KEY } from "@/constants/localStorageKey";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

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

export const toggleFavorite = (list: FavoriteBook[], book: FavoriteBook): FavoriteBook[] =>
  isFavorite(list, book.isbn)
    ? list.filter((item) => item.isbn !== book.isbn)
    : [toFavoriteBook(book), ...list];
