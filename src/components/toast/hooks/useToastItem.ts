import { useEffect, useState } from "react";

const DEFAULT_DURATION = 3000;
const EXIT_DURATION = 200;

const useToastItem = (params: { id: string; onRemove: (id: string) => void }) => {
  const { id, onRemove } = params;

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 일정 시간 표시 → fade-out 시작 → 애니메이션 종료 시점에 제거
    const exitTimer = setTimeout(() => setIsExiting(true), DEFAULT_DURATION);
    const removeTimer = setTimeout(() => onRemove(id), DEFAULT_DURATION + EXIT_DURATION);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [id, onRemove]);

  const handleClose = () => onRemove(id);

  return { isExiting, handleClose };
};

export { useToastItem };
