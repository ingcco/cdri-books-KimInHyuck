import { tv } from "tailwind-variants";

export const favoritesPageVariants = tv({
  slots: {
    container: "mx-auto flex size-full min-h-0 max-w-[960px] flex-col gap-6 py-20",
    title: "title2 text-[#1A1E27]",
    result: "flex min-h-0 flex-1 flex-col gap-9",
    count: "caption text-text-primary flex items-center gap-4",
    empty: "flex flex-col items-center gap-6 py-20",
    scrollArea: "min-h-0 flex-1 overflow-y-auto",
    bookList: "relative border-t border-[#D2D6DA]",
  },
});

export type FavoritesPageVariants = typeof favoritesPageVariants;
