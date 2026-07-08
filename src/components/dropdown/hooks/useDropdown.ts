import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";

interface DropdownContextValue<T extends string = string> {
  label: string;
  listboxId: string;
  isOpen: boolean;
  value: T | undefined;
  highlightedValue: T | undefined;
  containerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLUListElement | null>;
  dropdownHandler: {
    toggle: () => void;
    open: () => void;
    close: () => void;
    select: (next: T) => void;
    moveHighlight: (direction: "next" | "prev") => void;
    selectHighlighted: () => void;
    setHighlightedValue: (next: T | undefined) => void;
  };
}

const DropdownContext = createContext<DropdownContextValue<string> | null>(null);

const useDropdownContext = <T extends string = string>() => {
  const context = useContext(DropdownContext) as DropdownContextValue<T> | null;
  if (!context) throw new Error("Dropdown 하위 컴포넌트는 <Dropdown> 안에서 사용하세요");
  return context;
};

const useDropdown = <T extends string>(
  label: string,
  value: T | undefined,
  onChange: (value: T) => void
) => {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedValue, setHighlightedValue] = useState<T | undefined>(value);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const dropdownHandler = {
    toggle: () => setIsOpen((prev) => !prev),
    open: () => {
      setHighlightedValue(value);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    select: (next: T) => {
      onChange(next);
      setIsOpen(false);
    },
    moveHighlight: (direction: "next" | "prev") => {
      if (!contentRef.current) return;
      const options = Array.from(
        contentRef.current.querySelectorAll<HTMLElement>('[role="option"]')
      );
      if (options.length === 0) return;

      const values = options.map((option) => option.dataset.value);
      const currentIndex = values.indexOf(highlightedValue);
      const step = direction === "next" ? 1 : -1;
      const nextIndex = Math.min(Math.max(currentIndex + step, 0), values.length - 1);

      setHighlightedValue(values[nextIndex] as T | undefined);
    },
    selectHighlighted: () => {
      if (highlightedValue === undefined) return;
      onChange(highlightedValue);
      setIsOpen(false);
    },
    setHighlightedValue,
  };

  return {
    label,
    listboxId,
    isOpen,
    value,
    highlightedValue,
    containerRef,
    contentRef,
    dropdownHandler,
  };
};

export { DropdownContext, useDropdown, useDropdownContext };
export type { DropdownContextValue };
