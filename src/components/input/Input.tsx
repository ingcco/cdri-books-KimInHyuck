import type { ComponentProps, KeyboardEvent, ReactNode, Ref } from "react";
import type { VariantProps } from "tailwind-variants";
import { useInput } from "./hooks/useInput";
import { inputVariants } from "./Input.style";

export interface InputProps
  extends Omit<ComponentProps<"input">, "prefix">, VariantProps<typeof inputVariants> {
  ref?: Ref<HTMLInputElement>;
  prefix?: ReactNode;
  suffix?: ReactNode;
  containerClassName?: string;
  onEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const Input = (props: InputProps) => {
  const {
    ref,
    prefix,
    suffix,
    disabled,
    containerClassName,
    className,
    onChange,
    onKeyDown,
    onEnter,
    ...rest
  } = props;

  const { handleChange, handleKeyDown, handleCompositionStart, handleCompositionEnd } = useInput({
    onChange,
    onKeyDown,
    onEnter,
  });
  const styles = inputVariants({ disabled });

  return (
    <div className={styles.container({ className: containerClassName })}>
      {prefix}
      <input
        ref={ref}
        disabled={disabled ?? false}
        {...rest}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        className={styles.input({ className })}
      />
      {suffix}
    </div>
  );
};

export default Input;
