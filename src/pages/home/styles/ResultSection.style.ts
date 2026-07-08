import { tv } from "tailwind-variants";

export const resultSectionVariants = tv({
  slots: {
    section: "flex flex-col gap-4",
    searching: "caption text-text-secondary py-20 text-center",
  },
});

export type ResultSectionVariants = typeof resultSectionVariants;
