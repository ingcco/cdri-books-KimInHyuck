import { tv } from "tailwind-variants";

export const searchVariants = tv({
  slots: {
    container:
      "h-[50px] gap-[11px] rounded-full border-none bg-light-gray pr-4 pl-2.5 focus-within:ring-2 focus-within:ring-primary",
    input: "caption text-black placeholder:text-text-subtitle",
    icon: "size-[30px] shrink-0",
  },
});

export type SearchVariants = typeof searchVariants;
