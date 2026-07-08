import { tv } from "tailwind-variants";

export const searchBarVariants = tv({
  slots: {
    wrapper: "flex items-center gap-4",
    searchArea: "relative w-[480px]",
    detailArea: "relative",
    historyList:
      "bg-light-gray absolute top-full left-0 z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-[16px] py-2 shadow-sm",
    historyItem: "flex items-center justify-between px-5 py-2",
    historyLabel: "body2 text-text-secondary flex-1 truncate text-left",
    historyRemove: "body2 text-text-subtitle shrink-0 px-1",
  },
});

export type SearchBarVariants = typeof searchBarVariants;
