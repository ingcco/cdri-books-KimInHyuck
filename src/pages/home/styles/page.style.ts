import { tv } from "tailwind-variants";

export const pageVariants = tv({
  slots: {
    container: "mx-auto flex w-full max-w-[960px] flex-col gap-6 px-4 py-20",
    title: "title2 text-[#1A1E27]",
  },
});

export type PageVariants = typeof pageVariants;
