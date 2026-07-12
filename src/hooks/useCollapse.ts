import { useState } from "react";

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
