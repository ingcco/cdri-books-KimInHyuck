import ChevronIcon from "@/assets/icons/chevron-down.svg";
import Button from "@/components/button/Button";
import LikeButton from "@/components/likebutton/LikeButton";
import type { BookData } from "@/lib/api/books/api.interface";
import { toComma } from "@/utils/number";

export interface BookListItemProps {
  book: BookData;
  isOpen: boolean;
  onToggleOpen: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

// 썸네일 + 하트 오버레이 (collapsed 48×68/하트16, expanded 210×280/하트24)
const BookThumbnail = ({
  book,
  variant,
  isFavorite,
  onToggleFavorite,
}: {
  book: BookData;
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
        onToggle={onToggleFavorite}
        size={variant === "collapsed" ? "sm" : "lg"}
        className="absolute top-1 right-1"
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
  onToggleOpen,
  className,
}: {
  isOpen: boolean;
  onToggleOpen: () => void;
  className?: string;
}) => (
  <Button buttonType="gray" size="md" className={`gap-1 ${className ?? ""}`} onClick={onToggleOpen}>
    상세보기
    <ChevronIcon aria-hidden="true" className={`size-4 ${isOpen ? "rotate-180" : ""}`} />
  </Button>
);

const BookListItem = (props: BookListItemProps) => {
  const { book, isOpen, onToggleOpen, isFavorite, onToggleFavorite } = props;

  const authors = book.authors.join(", ");
  const hasSale = book.sale_price >= 0;
  const finalPrice = hasSale ? book.sale_price : book.price;

  return (
    <li className="border-b border-[#D2D6DA]">
      {isOpen ? (
        <div className="flex gap-8 px-4 py-6">
          <BookThumbnail
            book={book}
            variant="expanded"
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="flex items-baseline gap-4">
              <h3 className="title3 text-text-primary leading-[26px]">{book.title}</h3>
              <span className="body2 text-text-subtitle">{authors}</span>
            </div>
            <div className="flex flex-col gap-3">
              <span className="body2-bold text-text-primary">책 소개</span>
              <p className="small text-text-secondary leading-4">{book.contents}</p>
            </div>
          </div>
          <div className="flex w-[240px] shrink-0 flex-col justify-between">
            <div className="flex flex-col items-end gap-1">
              {hasSale && (
                <>
                  <span className="small text-text-subtitle">원가</span>
                  <span className="text-text-primary text-[18px] font-light line-through">
                    {toComma(book.price, "원")}
                  </span>
                </>
              )}
              <span className="small text-text-subtitle">{hasSale ? "할인가" : "가격"}</span>
              <span className="title3 text-text-primary">{toComma(finalPrice, "원")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <BuyLink url={book.url} className="w-full" />
              <DetailToggle isOpen={isOpen} onToggleOpen={onToggleOpen} className="w-full" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[100px] items-center gap-6 px-4">
          <BookThumbnail
            book={book}
            variant="collapsed"
            isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite}
          />
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <h3 className="title3 text-text-primary truncate">{book.title}</h3>
            <span className="body2 text-text-secondary shrink-0">{authors}</span>
          </div>
          <span className="title3 text-text-primary shrink-0">{toComma(finalPrice, "원")}</span>
          <div className="flex shrink-0 items-center gap-2">
            <BuyLink url={book.url} className="w-[115px]" />
            <DetailToggle isOpen={isOpen} onToggleOpen={onToggleOpen} className="w-[115px] px-3" />
          </div>
        </div>
      )}
    </li>
  );
};

export default BookListItem;
