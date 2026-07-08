import type { ComponentProps } from "react";
import LikeFillIcon from "@/assets/icons/like-fill.svg";
import LikeLineIcon from "@/assets/icons/like-line.svg";

export interface LikeButtonProps extends Omit<ComponentProps<"button">, "onClick"> {
  isFavorite: boolean;
  onToggle: () => void;
  /** sm: 리스트 오버레이 16 / lg: 아코디언 24 */
  size?: "sm" | "lg";
}

const LikeButton = (props: LikeButtonProps) => {
  const { isFavorite, onToggle, size = "lg", className, ...rest } = props;

  const Icon = isFavorite ? LikeFillIcon : LikeLineIcon;
  const iconSize = size === "sm" ? "size-4" : "size-6";

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "찜 해제" : "찜하기"}
      className={`focus-visible:outline-primary flex items-center justify-center rounded-full focus-visible:outline-2 ${className ?? ""}`}
      onClick={onToggle}
      {...rest}
    >
      <Icon aria-hidden="true" className={iconSize} />
    </button>
  );
};

export default LikeButton;
