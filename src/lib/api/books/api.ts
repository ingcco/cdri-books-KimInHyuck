import { api } from "../index";
import type { Response } from "../shared/response";
import type { BookData, BookListParams } from "./api.interface";

export const getBookList = async (params: BookListParams) => {
  const res = await api.get<Response<BookData>>("/v3/search/book", { params });
  return res.data;
};
