import { tv } from "tailwind-variants";

export const detailSearchPopoverVariants = tv({
  slots: {
    popover:
      "absolute top-full right-0 z-20 mt-2 flex w-[360px] flex-col gap-4 rounded-[8px] bg-white px-6 pt-2 pb-6 shadow-[0px_4px_14px_0px_rgba(0,0,0,0.1)]",
    close: "cursor-pointer self-end text-text-subtitle hover:text-text-primary",
    row: "flex items-end gap-1",
    dropdown: "w-[100px] shrink-0",
    input:
      "flex-1 rounded-none border-0 border-b border-[#D2D6DA] px-0 focus-within:border-primary",
  },
});

export type DetailSearchPopoverVariants = typeof detailSearchPopoverVariants;
