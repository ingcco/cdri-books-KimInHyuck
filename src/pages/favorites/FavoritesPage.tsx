import FavoriteBookItem from "./components/FavoriteBookItem";
import {
  FavoritesPageContext,
  useFavoritesPage,
  useFavoritesPageContext,
} from "./hooks/useFavoritesPage";
import { favoritesPageVariants } from "./styles/FavoritesPage.style";
import emptyImage from "@/assets/images/image_empty.png";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import { toComma } from "@/utils/number";

const styles = favoritesPageVariants();

const FavoritesPageContent = () => {
  const { result } = useFavoritesPageContext();
  const { scrollRef, virtualizer, virtualItems } = useVirtualScroll({
    count: result.books.length,
    hasNextPage: result.hasMore,
    onLoadMore: result.loadMore,
  });

  return (
    <div className={styles.container()}>
      <h1 className={styles.title()}>내가 찜한 책</h1>

      {result.isEmpty ? (
        <div className={styles.empty()}>
          <img src={emptyImage} alt="" className="size-20 object-contain" />
          <p className="caption text-text-secondary">찜한 책이 없습니다.</p>
        </div>
      ) : (
        <section className={styles.result()}>
          <p className={styles.count()} aria-live="polite">
            <span>찜한 책</span>
            <span>
              총 <span className="text-primary">{toComma(result.totalCount)}</span>건
            </span>
          </p>
          <div ref={scrollRef} className={styles.scrollArea()}>
            <ul className={styles.bookList()} style={{ height: virtualizer.getTotalSize() }}>
              {virtualItems.map((virtualItem) => {
                const book = result.books[virtualItem.index];
                if (!book) return null;

                return (
                  <li
                    key={book.isbn}
                    ref={virtualizer.measureElement}
                    data-index={virtualItem.index}
                    className="absolute top-0 left-0 w-full"
                    style={{ transform: `translateY(${virtualItem.start}px)` }}
                  >
                    <FavoriteBookItem book={book} />
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
};

const FavoritesPage = () => {
  const value = useFavoritesPage();

  return (
    <FavoritesPageContext.Provider value={value}>
      <FavoritesPageContent />
    </FavoritesPageContext.Provider>
  );
};

export default FavoritesPage;
