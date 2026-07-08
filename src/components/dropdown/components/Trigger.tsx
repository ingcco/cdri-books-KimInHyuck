import type { KeyboardEvent, ReactNode } from "react";
import { dropdownVariants } from "../Dropdown.style";
import { useDropdownContext } from "../hooks/useDropdown";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg";

export interface DropdownTriggerProps {
  children?: ReactNode;
  placeholder?: string;
  className?: string;
}

const Trigger = ({ children, placeholder, className }: DropdownTriggerProps) => {
  const { label, listboxId, isOpen, highlightedValue, dropdownHandler } = useDropdownContext();
  const styles = dropdownVariants();

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      // Content(listbox)가 아직 DOM에 없는 첫 오픈 프레임엔 moveHighlight가 옵션을 못 찾음 — 열기만 하고, 다음 입력부터 이동
      if (isOpen) dropdownHandler.moveHighlight("next");
      else dropdownHandler.open();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isOpen) dropdownHandler.moveHighlight("prev");
      else dropdownHandler.open();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpen) dropdownHandler.selectHighlighted();
      else dropdownHandler.open();
    } else if (e.key === "Escape") {
      dropdownHandler.close();
    }
  };

  return (
    <button
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={listboxId}
      aria-activedescendant={
        isOpen && highlightedValue ? `${listboxId}-${highlightedValue}` : undefined
      }
      aria-label={label}
      className={styles.trigger({ className })}
      onClick={dropdownHandler.toggle}
      onKeyDown={handleKeyDown}
    >
      <span>{children ?? placeholder}</span>
      <ChevronDownIcon
        aria-hidden="true"
        className={styles.chevron({ className: isOpen ? "rotate-180" : undefined })}
      />
    </button>
  );
};

export default Trigger;
