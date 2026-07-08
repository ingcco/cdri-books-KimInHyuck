import { useEffect, useRef, useState } from "react";
import BookListItem from "./BookListItem";
import EmptyState from "@/components/emptystate/EmptyState";
import type { BookData } from "@/lib/api/books/api.interface";

export interface BookListProps {
  books: BookData[];
  isFavorite: (isbn: string) => boolean;
  onToggleFavorite: (book: BookData) => void;
  /** 무한 스크롤 — 다음 페이지 로드 트리거 (미지정 시 sentinel 미렌더) */
  onLoadMore?: () => void;
  hasMore?: boolean;
  /** books가 비었을 때 표시할 문구 (미지정 시 빈 목록만) */
  empty?: string;
}

const BookList = (props: BookListProps) => {
  const { books, isFavorite, onToggleFavorite, onLoadMore, hasMore, empty } = props;

  // 아코디언 단일 열림 — 열린 항목의 isbn 하나만 보관
  const [openIsbn, setOpenIsbn] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !onLoadMore || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) onLoadMore();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore]);

  if (books.length === 0) {
    return empty ? <EmptyState message={empty} /> : null;
  }

  return (
    <ul className="border-t border-[#D2D6DA]">
      {books.map((book) => (
        <BookListItem
          key={book.isbn}
          book={book}
          isOpen={openIsbn === book.isbn}
          onToggleOpen={() => setOpenIsbn(openIsbn === book.isbn ? null : book.isbn)}
          isFavorite={isFavorite(book.isbn)}
          onToggleFavorite={() => onToggleFavorite(book)}
        />
      ))}
      {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-10" />}
    </ul>
  );
};

export default BookList;
