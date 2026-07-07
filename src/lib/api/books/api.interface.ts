import type { Pageable } from "../shared/request";

export type SearchTarget = "title" | "isbn" | "publisher" | "person";

export interface BookListParams extends Pageable {
  query: string;
  target?: SearchTarget;
  sort?: "accuracy" | "latest";
}

export interface BookData {
  title: string;
  contents: string;
  url: string;
  isbn: string;
  datetime: string;
  authors: string[];
  publisher: string;
  translators: string[];
  price: number;
  sale_price: number;
  thumbnail: string;
  status: string;
}
