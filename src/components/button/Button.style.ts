import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  slots: {
    base: [
      "relative flex items-center justify-center",
      "w-fit gap-2 rounded-[8px] whitespace-nowrap transition-colors",
    ],
  },
  variants: {
    buttonType: {
      primary: { base: "bg-primary text-white enabled:hover:bg-primary/90" },
      outline: {
        base: "border border-text-subtitle text-text-subtitle enabled:hover:bg-light-gray",
      },
      gray: { base: "bg-light-gray text-text-secondary enabled:hover:bg-gray" },
    },
    size: {
      sm: { base: "h-[35px] px-3 body2" },
      md: { base: "h-[48px] px-5 caption" },
      full: { base: "h-[36px] w-full body2" },
    },
    disabled: {
      true: { base: "cursor-not-allowed opacity-50" },
      false: { base: "cursor-pointer" },
    },
  },
  defaultVariants: {
    buttonType: "primary",
    size: "md",
    disabled: false,
  },
});

export type ButtonVariants = typeof buttonVariants;
