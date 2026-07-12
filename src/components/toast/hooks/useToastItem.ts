import { useEffect, useState } from "react";

const DEFAULT_DURATION = 3000;
const EXIT_DURATION = 200;

const useToastItem = (params: { id: string; onRemove: (id: string) => void }) => {
  const { id, onRemove } = params;

  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
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
