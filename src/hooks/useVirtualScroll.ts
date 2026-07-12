import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

// 새 검색 등으로 스크롤을 top에서 다시 시작해야 하면 소비처가 이 훅을 쓰는 컴포넌트에 `key`를
// 부여해 재마운트한다(virtualizer가 이전 offset을 새 엘리먼트에 복원하므로 명령형 초기화는 부적합).
export const useVirtualScroll = ({
  count,
  hasNextPage,
  onLoadMore,
  estimateSize = 100,
}: {
  count: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
  estimateSize?: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const shouldLoadMore =
    hasNextPage && count > 0 && (virtualItems.at(-1)?.index ?? -1) >= count - 1;

  useEffect(() => {
    if (shouldLoadMore) onLoadMore();
  }, [shouldLoadMore, onLoadMore]);

  return { scrollRef, virtualizer, virtualItems };
};
