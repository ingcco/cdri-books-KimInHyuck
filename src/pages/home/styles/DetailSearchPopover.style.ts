import { tv } from "tailwind-variants";

export const detailSearchPopoverVariants = tv({
  slots: {
    popover:
      "absolute top-full right-0 z-20 mt-2 flex w-[360px] flex-col gap-4 rounded-[8px] bg-white px-6 py-9 shadow-[0px_4px_14px_0px_rgba(0,0,0,0.1)]",
    // 닫기 X — Figma: 우상단 인셋 8, 컨테이너 20×20 / X 12×12 #B1B8C0
    close:
      "absolute right-2 top-2 flex size-5 cursor-pointer items-center justify-center text-[#B1B8C0] hover:text-text-primary",
    row: "flex items-end gap-1",
    dropdown: "w-[100px] shrink-0",
    // 입력 208×36(Figma) — filter(제목)와 동일 높이로 정렬. 언더라인 기본 회색, 포커스 시 primary(#4880EE)
    input:
      "h-9 flex-1 rounded-none border-0 border-b border-[#D2D6DA] px-0 focus-within:border-primary",
  },
});

export type DetailSearchPopoverVariants = typeof detailSearchPopoverVariants;
