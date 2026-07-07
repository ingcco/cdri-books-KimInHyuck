import type { BookListParams } from "../books/api.interface";

export const bookKeys = {
  all: ["books"] as const,
  list: (params: Omit<BookListParams, "page" | "size">) =>
    [...bookKeys.all, "list", params] as const,
};
