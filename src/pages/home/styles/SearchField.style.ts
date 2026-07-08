import { tv } from "tailwind-variants";

export const searchFieldVariants = tv({
  slots: {
    searchArea: "relative w-[480px]",
    historyList:
      "bg-light-gray absolute top-full left-0 z-10 mt-1 max-h-72 w-full overflow-y-auto rounded-[16px] py-2 shadow-sm",
    historyItem: "flex items-center justify-between px-5 py-2 hover:bg-gray",
    historyLabel: "body2 text-text-secondary flex-1 cursor-pointer truncate text-left",
    historyRemove: "body2 text-text-subtitle shrink-0 cursor-pointer px-1",
  },
});

export type SearchFieldVariants = typeof searchFieldVariants;
