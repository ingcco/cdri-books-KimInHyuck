import { tv } from "tailwind-variants";

export const homePageVariants = tv({
  slots: {
    container: "mx-auto flex min-h-0 max-w-[992px] flex-col gap-6 px-4 py-20 size-full",
    title: "title2 text-[#1A1E27]",
    searchRow: "flex items-center gap-4",
    detailArea: "relative",
    result: "flex min-h-0 flex-1 flex-col gap-9",
    count: "caption text-text-primary flex items-center gap-4",
    searching: "caption text-text-secondary py-20 text-center",
    scrollArea: "min-h-0 flex-1 overflow-y-auto",
    bookList: "relative border-t border-[#D2D6DA]",
  },
});

export type HomePageVariants = typeof homePageVariants;
