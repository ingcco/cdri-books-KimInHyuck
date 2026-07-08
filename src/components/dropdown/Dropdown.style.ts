import { tv } from "tailwind-variants";

export const dropdownVariants = tv({
  slots: {
    trigger:
      "flex w-full cursor-pointer items-center justify-between gap-1 border-b border-[#D2D6DA] py-2 body2-bold text-text-primary outline-none focus-visible:border-primary",
    content: "absolute z-10 mt-1 w-full rounded-[8px] border border-gray bg-white py-1 shadow-md",
    item: "cursor-pointer px-3 py-2 body2 text-text-primary aria-selected:text-primary data-[highlighted=true]:bg-light-gray",
    chevron: "size-5 shrink-0 transition-transform duration-150",
  },
});

export type DropdownVariants = typeof dropdownVariants;
