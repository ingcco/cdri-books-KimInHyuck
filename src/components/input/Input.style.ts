import { tv } from "tailwind-variants";

export const inputVariants = tv({
  slots: {
    container: [
      "flex items-center gap-2",
      "rounded-[8px] border border-gray bg-white px-3",
      "focus-within:border-primary",
    ],
    input: [
      "min-w-0 flex-1 bg-transparent",
      "body2 text-black placeholder:text-text-subtitle focus:outline-none",
    ],
  },
  variants: {
    disabled: {
      true: { container: "cursor-not-allowed opacity-50" },
      false: { container: "cursor-text" },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export type InputVariants = typeof inputVariants;
