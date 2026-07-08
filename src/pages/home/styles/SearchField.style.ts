import { tv } from "tailwind-variants";

export const searchFieldVariants = tv({
  slots: {
    searchArea: "relative w-[480px]",
    // 히스토리 = 입력창과 이어진 하나의 박스(연속) — 입력 pill 아래에 붙어 하단만 둥글게(r24)
    historyList:
      "bg-light-gray absolute top-[50px] left-0 z-10 w-full overflow-hidden rounded-b-[24px] pb-6",
    historyItem: "flex h-10 items-center pr-[25px] pl-[51px]",
    historyLabel:
      "flex-1 cursor-pointer truncate text-left text-base font-medium text-text-subtitle",
    historyRemove: "flex size-6 shrink-0 cursor-pointer items-center justify-center text-black",
    clear: "flex size-6 shrink-0 cursor-pointer items-center justify-center text-[#B1B8C0]",
  },
});

export type SearchFieldVariants = typeof searchFieldVariants;
