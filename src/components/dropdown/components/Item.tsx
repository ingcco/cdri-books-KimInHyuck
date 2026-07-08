import type { ReactNode } from "react";
import { dropdownVariants } from "../Dropdown.style";
import { useDropdownContext } from "../hooks/useDropdown";

export interface DropdownItemProps<T extends string = string> {
  value: T;
  children: ReactNode;
}

const Item = <T extends string = string>({ value, children }: DropdownItemProps<T>) => {
  const {
    listboxId,
    value: selectedValue,
    highlightedValue,
    dropdownHandler,
  } = useDropdownContext<T>();
  const styles = dropdownVariants();

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events -- 키보드 조작은 Trigger(combobox)의 aria-activedescendant가 담당, option은 마우스 전용
    <li
      id={`${listboxId}-${value}`}
      role="option"
      data-value={value}
      aria-selected={value === selectedValue}
      data-highlighted={value === highlightedValue}
      className={styles.item()}
      onClick={() => dropdownHandler.select(value)}
      onMouseEnter={() => dropdownHandler.setHighlightedValue(value)}
    >
      {children}
    </li>
  );
};

export default Item;
