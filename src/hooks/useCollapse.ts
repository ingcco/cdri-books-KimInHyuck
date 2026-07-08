import { useState } from "react";

/**
 * 아코디언 열림/닫힘을 대칭으로 애니하기 위한 상세 콘텐츠 렌더 제어.
 *
 * 닫을 때 콘텐츠를 즉시 collapsed로 교체하면 framer가 `height: auto`를 collapsed 높이로
 * 측정해 닫힘 트윈이 사라진다(즉시 닫힘). 열림은 콘텐츠를 먼저 렌더하고, 닫힘은 높이 트윈이
 * 끝난 뒤 언마운트해 양방향 모두 부드럽게 만든다.
 */
export const useCollapse = (isOpen: boolean) => {
  const [showDetail, setShowDetail] = useState(isOpen);

  // 열림 — 상세를 먼저 렌더(트윈이 100→auto로 드러냄)
  if (isOpen && !showDetail) setShowDetail(true);

  // 닫힘 — 높이 트윈이 끝난 뒤 상세 언마운트
  const onAnimationComplete = () => {
    if (!isOpen) setShowDetail(false);
  };

  return { showDetail, onAnimationComplete };
};
