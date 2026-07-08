import emptyImage from "@/assets/images/image_empty.png";

export interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-20">
      <img src={emptyImage} alt="" className="size-20 object-contain" />
      <p className="caption text-text-secondary">{message}</p>
    </div>
  );
};

export default EmptyState;
