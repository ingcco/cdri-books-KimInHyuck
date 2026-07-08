import type { BookListParams } from "../books/api.interface";

export const bookKeys = {
  all: ["books"] as const,
  list: (params: Omit<BookListParams, "page">) => [...bookKeys.all, "list", params] as const,
};
