import type { Ref } from "react";
import Input, { type InputProps } from "../Input";
import { searchVariants } from "./Search.style";
import SearchIcon from "@/assets/icons/search.svg";

export interface SearchProps extends Omit<InputProps, "prefix"> {
  ref?: Ref<HTMLInputElement>;
}

const Search = (props: SearchProps) => {
  const { ref, className, containerClassName, ...rest } = props;

  const styles = searchVariants();

  return (
    <Input
      ref={ref}
      type="search"
      aria-label="검색어"
      prefix={<SearchIcon aria-hidden="true" className={styles.icon()} />}
      containerClassName={styles.container({ className: containerClassName })}
      className={styles.input({ className })}
      {...rest}
    />
  );
};

export default Search;
