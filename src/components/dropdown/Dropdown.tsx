import type { ReactNode } from "react";
import Content from "./components/Content";
import Item from "./components/Item";
import Trigger from "./components/Trigger";
import { DropdownContext, useDropdown } from "./hooks/useDropdown";
import type { DropdownContextValue } from "./hooks/useDropdown";

export interface DropdownListItem<T extends string = string> {
  label: string;
  value: T;
}

export interface DropdownProps<T extends string = string> {
  label: string;
  value: T | undefined;
  onChange: (value: T) => void;
  list?: DropdownListItem<T>[];
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

const DropdownRoot = <T extends string = string>({
  label,
  value,
  onChange,
  list,
  placeholder,
  className,
  children,
}: DropdownProps<T>) => {
  const context = useDropdown(label, value, onChange);
  const { containerRef } = context;

  return (
    <DropdownContext.Provider value={context as unknown as DropdownContextValue<string>}>
      <div ref={containerRef} className="relative">
        {list ? (
          <>
            <Trigger placeholder={placeholder} className={className}>
              {list.find((item) => item.value === value)?.label}
            </Trigger>
            <Content>
              {list.map((item) => (
                <Item key={item.value} value={item.value}>
                  {item.label}
                </Item>
              ))}
            </Content>
          </>
        ) : (
          children
        )}
      </div>
    </DropdownContext.Provider>
  );
};

const Dropdown = DropdownRoot as typeof DropdownRoot & {
  Trigger: typeof Trigger;
  Content: typeof Content;
  Item: typeof Item;
};
Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Item = Item;

export default Dropdown;
