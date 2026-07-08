import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps, ReactNode, Ref } from "react";
import type { VariantProps } from "tailwind-variants";
import { buttonVariants } from "./Button.style";

export interface ButtonProps
  extends Omit<ComponentProps<"button">, "disabled">, VariantProps<typeof buttonVariants> {
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
  asChild?: boolean;
}

const Button = (props: ButtonProps) => {
  const { ref, children, className, buttonType, size, disabled, asChild, ...rest } = props;

  const Comp = asChild ? Slot : "button";
  const styles = buttonVariants({ buttonType, size, disabled });

  return (
    <Comp ref={ref} className={styles.base({ className })} disabled={disabled} {...rest}>
      {children}
    </Comp>
  );
};

export default Button;
