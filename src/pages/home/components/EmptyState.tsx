import { m } from "framer-motion";
import emptyImage from "@/assets/images/image_empty.png";
import { animation } from "@/lib/animation/transition";

export interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <m.div {...animation.fade} className="flex flex-col items-center gap-6 py-20">
      <img src={emptyImage} alt="" className="size-20 object-contain" />
      <p className="caption text-text-secondary">{message}</p>
    </m.div>
  );
};

export default EmptyState;
