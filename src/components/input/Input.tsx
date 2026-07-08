import type { ComponentProps, KeyboardEvent, ReactNode, Ref } from "react";
import type { VariantProps } from "tailwind-variants";
import { useInput } from "./hooks/useInput";
import { inputVariants } from "./Input.style";

export interface InputProps
  extends Omit<ComponentProps<"input">, "prefix">, VariantProps<typeof inputVariants> {
  ref?: Ref<HTMLInputElement>;
  /** input 앞에 표시할 요소 (아이콘 등) */
  prefix?: ReactNode;
  /** input 뒤에 표시할 요소 (아이콘, 버튼 등) */
  suffix?: ReactNode;
  /** container(최상위 wrapper)에 적용할 추가 className */
  containerClassName?: string;
  /** IME 조합 확정 Enter를 제외한 실제 Enter 입력 시 호출 */
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
