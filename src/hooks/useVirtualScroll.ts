import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";

// 세로 리스트 가상 스크롤 — 스크롤 컨테이너 ref를 소유(Context에 ref를 싣지 않음)하고,
// 높이가 가변인 아이템(아코디언 확장 등)은 measureElement로 실측한다.
// 마지막 아이템에 도달하면 다음 청크를 로드(무한 스크롤).
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
  const reachedEnd = count > 0 && (virtualItems.at(-1)?.index ?? -1) >= count - 1;

  useEffect(() => {
    if (reachedEnd && hasNextPage) onLoadMore();
  }, [reachedEnd, hasNextPage, onLoadMore]);

  return { scrollRef, virtualizer, virtualItems };
};
