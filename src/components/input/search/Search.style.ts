import { tv } from "tailwind-variants";

export const searchVariants = tv({
  slots: {
    container:
      "h-[50px] rounded-full border-none bg-light-gray px-4 focus-within:ring-2 focus-within:ring-primary",
    input: "text-black placeholder:text-text-subtitle",
    icon: "size-5 shrink-0",
  },
});

export type SearchVariants = typeof searchVariants;
