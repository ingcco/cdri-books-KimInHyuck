import { describe, expect, it } from "vitest";
import { isFavorite, toggleFavorite } from "./favorites";

const book = (isbn: string) => ({
  isbn,
  title: `제목-${isbn}`,
  contents: "책 소개",
  url: "https://book.example/1",
  authors: ["저자"],
  price: 10000,
  sale_price: 9000,
  thumbnail: "https://img.example/1.jpg",
  datetime: "2020-01-01T00:00:00.000+09:00",
  publisher: "출판사",
  translators: [],
  status: "정상판매",
});

const CURATED_KEYS = [
  "authors",
  "contents",
  "isbn",
  "price",
  "sale_price",
  "thumbnail",
  "title",
  "url",
];

describe("favorites — 찜 도메인 규칙(순수 함수)", () => {
  it("찜 추가 시 렌더 필드만 큐레이션한 스냅샷을 맨 앞에 넣는다(잉여 필드 제거)", () => {
    const next = toggleFavorite([], book("111"));

    expect(next).toHaveLength(1);
    expect(Object.keys(next[0]!).sort()).toEqual(CURATED_KEYS);
    expect(next[0]).not.toHaveProperty("publisher");
    expect(next[0]).not.toHaveProperty("status");
  });

  it("이미 찜한 isbn을 토글하면 목록에서 제거한다", () => {
    const list = toggleFavorite([], book("111"));
    const next = toggleFavorite(list, book("111"));

    expect(next).toHaveLength(0);
  });

  it("새로 찜한 책은 최신순으로 맨 앞에 쌓인다", () => {
    const list = toggleFavorite(toggleFavorite([], book("111")), book("222"));

    expect(list.map((b) => b.isbn)).toEqual(["222", "111"]);
  });

  it("isFavorite는 isbn 포함 여부를 반환한다", () => {
    const list = toggleFavorite([], book("111"));

    expect(isFavorite(list, "111")).toBe(true);
    expect(isFavorite(list, "999")).toBe(false);
  });
});
