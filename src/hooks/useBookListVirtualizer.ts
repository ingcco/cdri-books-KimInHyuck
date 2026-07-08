import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

// 도서 결과 가상 스크롤 — 스크롤 컨테이너 ref를 소유(Context에 ref를 싣지 않음)하고,
// 아코디언 확장으로 높이가 가변이라 measureElement로 실측한다.
// 마지막 아이템에 도달하면 다음 페이지를 로드(무한 스크롤).
export const useBookListVirtualizer = ({
  count,
  hasNextPage,
  onLoadMore,
}: {
  count: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const reachedEnd = count > 0 && (virtualItems.at(-1)?.index ?? -1) >= count - 1;

  useEffect(() => {
    if (reachedEnd && hasNextPage) onLoadMore();
  }, [reachedEnd, hasNextPage, onLoadMore]);

  return { scrollRef, virtualizer, virtualItems };
};
