import BookListItem from "./components/BookListItem";
import DetailSearchPopover from "./components/DetailSearchPopover";
import EmptyState from "./components/EmptyState";
import SearchField from "./components/SearchField";
import { HomeContext, useHome, useHomeContext } from "./hooks/useHome";
import { homePageVariants } from "./styles/HomePage.style";
import Button from "@/components/button/Button";
import { useBookListVirtualizer } from "@/hooks/useBookListVirtualizer";
import { toComma } from "@/utils/number";

const styles = homePageVariants();

const HomePageContent = () => {
  const { filters, searchBar, result } = useHomeContext();
  const { scrollRef, virtualizer, virtualItems } = useBookListVirtualizer({
    count: result.data.documents.length,
    hasNextPage: result.hasNextPage,
    onLoadMore: result.fetchNextPage,
  });

  return (
    <div className={styles.container()}>
      <h1 className={styles.title()}>도서 검색</h1>

      <section className={styles.searchRow()}>
        {/* key — 통합검색↔상세검색 전환 시 입력 버퍼 리셋(상호배타) */}
        <SearchField key={filters.target} />
        <div className={styles.detailArea()}>
          <Button buttonType="outline" size="sm" onClick={searchBar.openDetail}>
            상세검색
          </Button>
          <DetailSearchPopover />
        </div>
      </section>

      {result.isFetched && (
        <section className={styles.result()}>
          <p className={styles.count()} aria-live="polite">
            <span>도서 검색 결과</span>
            <span>
              총 <span className="text-primary">{toComma(result.data.meta.total_count)}</span>건
            </span>
          </p>
          {result.isSearching && (
            <p role="status" className={styles.searching()}>
              검색 중입니다…
            </p>
          )}
          {result.isEmpty && <EmptyState message="검색된 결과가 없습니다." />}
          {result.hasBooks && (
            <div ref={scrollRef} className={styles.scrollArea()}>
              <ul className={styles.bookList()} style={{ height: virtualizer.getTotalSize() }}>
                {virtualItems.map((virtualItem) => {
                  const book = result.data.documents[virtualItem.index];
                  if (!book) return null;

                  return (
                    <li
                      key={book.isbn}
                      ref={virtualizer.measureElement}
                      data-index={virtualItem.index}
                      className="absolute top-0 left-0 w-full"
                      style={{ transform: `translateY(${virtualItem.start}px)` }}
                    >
                      <BookListItem book={book} />
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const HomePage = () => {
  const value = useHome();

  return (
    <HomeContext.Provider value={value}>
      <HomePageContent />
    </HomeContext.Provider>
  );
};

export default HomePage;
