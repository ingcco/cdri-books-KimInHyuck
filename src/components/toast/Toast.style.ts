import { tv } from "tailwind-variants";

export const toastVariants = tv({
  slots: {
    container: "pointer-events-none fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2",
    item: "pointer-events-auto flex items-center gap-3 rounded-[8px] border-l-[3px] border-red bg-white px-4 py-3 shadow-md transition-all duration-200",
    message: "body2 text-text-primary",
    close: "shrink-0 text-text-subtitle transition-colors hover:text-text-primary",
  },
  variants: {
    exiting: {
      true: { item: "-translate-y-2 opacity-0" },
      false: { item: "translate-y-0 opacity-100" },
    },
  },
  defaultVariants: {
    exiting: false,
  },
});

export type ToastVariants = typeof toastVariants;
