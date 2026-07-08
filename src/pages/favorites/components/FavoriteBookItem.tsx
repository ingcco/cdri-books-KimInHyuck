import { m } from "framer-motion";
import { useFavoritesPageContext } from "../hooks/useFavoritesPage";
import ChevronIcon from "@/assets/icons/chevron-down.svg";
import LikeFillIcon from "@/assets/icons/like-fill.svg";
import LikeLineIcon from "@/assets/icons/like-line.svg";
import Button from "@/components/button/Button";
import { useCollapse } from "@/hooks/useCollapse";
import type { FavoriteBook } from "@/hooks/useFavorites";
import { toComma } from "@/utils/number";

// 하트 토글 — 아이콘 전용 버튼(Button chrome 불필요), 찜 상태 a11y 계약 캡슐화
const LikeButton = ({
  isFavorite,
  size,
  className,
  onToggle,
}: {
  isFavorite: boolean;
  size: "sm" | "lg";
  className?: string;
  onToggle: () => void;
}) => {
  const Icon = isFavorite ? LikeFillIcon : LikeLineIcon;

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "찜 해제" : "찜하기"}
      className={`focus-visible:outline-primary flex items-center justify-center rounded-full focus-visible:outline-2 ${className ?? ""}`}
      onClick={onToggle}
    >
      <Icon aria-hidden="true" className={size === "sm" ? "size-4" : "size-6"} />
    </button>
  );
};

// 썸네일 + 하트 오버레이 (collapsed 48×68/하트16, expanded 210×280/하트24)
const BookThumbnail = ({
  book,
  variant,
  isFavorite,
  onToggleFavorite,
}: {
  book: FavoriteBook;
  variant: "collapsed" | "expanded";
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => {
  const boxSize = variant === "collapsed" ? "h-[68px] w-12" : "h-[280px] w-[210px]";

  return (
    <div className={`relative shrink-0 ${boxSize}`}>
      {book.thumbnail ? (
        <img src={book.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <div className="bg-light-gray size-full rounded-[4px]" />
      )}
      <LikeButton
        isFavorite={isFavorite}
        size={variant === "collapsed" ? "sm" : "lg"}
        className={`absolute ${variant === "collapsed" ? "top-0 right-0" : "top-2 right-2"}`}
        onToggle={onToggleFavorite}
      />
    </div>
  );
};

const BuyLink = ({ url, className }: { url: string; className?: string }) => (
  <Button asChild buttonType="primary" size="md" className={className}>
    <a href={url} target="_blank" rel="noopener noreferrer">
      구매하기
    </a>
  </Button>
);

const DetailToggle = ({
  isOpen,
  className,
  onToggleOpen,
}: {
  isOpen: boolean;
  className?: string;
  onToggleOpen: () => void;
}) => (
  <Button buttonType="gray" size="md" className={`gap-1 ${className ?? ""}`} onClick={onToggleOpen}>
    상세보기
    <ChevronIcon aria-hidden="true" className={`size-4 ${isOpen ? "rotate-180" : ""}`} />
  </Button>
);

// 찜 지역 도서 아이템 — 홈 BookListItem과 시각적으로 유사하나 찜 도메인에 독립(의도적 중복).
// FavoriteBook 스냅샷을 소비하고, 상태/핸들러는 찜 페이지 Context에서 조회한다.
const FavoriteBookItem = ({ book }: { book: FavoriteBook }) => {
  const { result } = useFavoritesPageContext();

  const isOpen = result.openIsbn === book.isbn;
  const { showDetail, onAnimationComplete } = useCollapse(isOpen);
  const isFavorite = result.favorite.isFavorite(book.isbn);
  const authors = book.authors.join(", ");
  const hasSale = book.sale_price >= 0;
  const finalPrice = hasSale ? book.sale_price : book.price;

  return (
    <m.div
      className="overflow-hidden border-b border-[#D2D6DA]"
      initial={false}
      animate={{ height: isOpen ? "auto" : 100 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onAnimationComplete}
    >
      {showDetail ? (
        <m.div
          className="flex py-6 pr-4 pl-[54px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <BookThumbnail
            book={book}
            variant="expanded"
            isFavorite={isFavorite}
            onToggleFavorite={() => result.favorite.toggle(book)}
          />
          <div className="ml-8 flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <h3 className="title3 text-text-primary leading-[26px]">{book.title}</h3>
              <span className="body2 text-text-subtitle">{authors}</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="body2-bold text-text-primary">책 소개</span>
              <p className="small text-text-primary leading-4">{book.contents}</p>
            </div>
          </div>
          <div className="ml-12 flex w-[240px] shrink-0 flex-col justify-between">
            <DetailToggle
              isOpen={isOpen}
              className="w-[115px] self-end"
              onToggleOpen={() => result.toggleOpen(book.isbn)}
            />
            <div className="flex flex-col items-end gap-2">
              {hasSale && (
                <div className="flex items-center gap-2">
                  <span className="small text-text-subtitle">원가</span>
                  <span className="text-text-primary text-[18px] font-light line-through">
                    {toComma(book.price, "원")}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="small text-text-subtitle">{hasSale ? "할인가" : "가격"}</span>
                <span className="title3 text-text-primary">{toComma(finalPrice, "원")}</span>
              </div>
            </div>
            <BuyLink url={book.url} className="w-full" />
          </div>
        </m.div>
      ) : (
        <m.div
          className="flex h-[100px] items-center pr-4 pl-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <BookThumbnail
            book={book}
            variant="collapsed"
            isFavorite={isFavorite}
            onToggleFavorite={() => result.favorite.toggle(book)}
          />
          <div className="ml-12 flex min-w-0 flex-1 items-center gap-4">
            <h3 className="title3 text-text-primary truncate">{book.title}</h3>
            <span className="body2 text-text-secondary shrink-0">{authors}</span>
          </div>
          <span className="title3 text-text-primary ml-6 shrink-0">
            {toComma(finalPrice, "원")}
          </span>
          <div className="ml-14 flex shrink-0 items-center gap-2">
            <BuyLink url={book.url} className="w-[115px]" />
            <DetailToggle
              isOpen={isOpen}
              className="w-[115px] px-3"
              onToggleOpen={() => result.toggleOpen(book.isbn)}
            />
          </div>
        </m.div>
      )}
    </m.div>
  );
};

export default FavoriteBookItem;
