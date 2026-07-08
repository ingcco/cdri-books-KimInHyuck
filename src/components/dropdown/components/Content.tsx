import type { ReactNode } from "react";
import { dropdownVariants } from "../Dropdown.style";
import { useDropdownContext } from "../hooks/useDropdown";

export interface DropdownContentProps {
  children: ReactNode;
  className?: string;
}

const Content = ({ children, className }: DropdownContentProps) => {
  const { label, listboxId, isOpen, contentRef } = useDropdownContext();
  const styles = dropdownVariants();

  if (!isOpen) return null;

  return (
    <ul
      ref={contentRef}
      id={listboxId}
      role="listbox"
      aria-label={label}
      className={styles.content({ className })}
    >
      {children}
    </ul>
  );
};

export default Content;
