import { tv } from "tailwind-variants";

export const detailSearchPopoverVariants = tv({
  slots: {
    popover:
      "absolute top-full right-0 z-20 mt-2 flex w-[360px] flex-col gap-4 rounded-[8px] bg-white px-6 py-9 shadow-[0px_4px_14px_0px_rgba(0,0,0,0.1)]",
    close:
      "absolute right-2 top-2 flex size-5 cursor-pointer items-center justify-center text-[#B1B8C0] hover:text-text-primary",
    row: "flex items-end gap-1",
    dropdown: "w-[100px] shrink-0",
    input:
      "h-9 flex-1 rounded-none border-0 border-b border-[#D2D6DA] px-0 focus-within:border-primary",
  },
});

export type DetailSearchPopoverVariants = typeof detailSearchPopoverVariants;
