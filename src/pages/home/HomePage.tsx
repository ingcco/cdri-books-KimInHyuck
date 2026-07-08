import BookListItem from "./components/BookListItem";
import DetailSearchPopover from "./components/DetailSearchPopover";
import EmptyState from "./components/EmptyState";
import SearchField from "./components/SearchField";
import { HomeContext, useHome, useHomeContext } from "./hooks/useHome";
import { homePageVariants } from "./styles/HomePage.style";
import Button from "@/components/button/Button";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import { toComma } from "@/utils/number";

const styles = homePageVariants();

// 가상 스크롤 결과 목록 — 소비처(HomePageContent)가 새 검색마다 검색키로 key를 부여해 재마운트하면
// virtualizer가 새로 생성되어 스크롤이 top에서 시작한다(이전 offset 복원 회피).
const BookResultList = () => {
  const { result } = useHomeContext();
  const { scrollRef, virtualizer, virtualItems } = useVirtualScroll({
    count: result.data.documents.length,
    hasNextPage: result.hasNextPage,
    onLoadMore: result.fetchNextPage,
  });

  return (
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
  );
};

const HomePageContent = () => {
  const { filters, searchBar, result } = useHomeContext();

  return (
    <div className={styles.container()}>
      <h1 className={styles.title()}>도서 검색</h1>

      <section className={styles.searchRow()}>
        <SearchField />
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
          {/* key — 새 검색(검색어/대상 변경)마다 재마운트해 스크롤을 top으로 초기화 */}
          {result.hasBooks && <BookResultList key={`${filters.q}|${filters.target}`} />}
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
