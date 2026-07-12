import { useEffect, useRef } from "react";

export const useOutsideClick = <T extends HTMLElement>(isOpen: boolean, onClose: () => void) => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onClose]);

  return ref;
};
