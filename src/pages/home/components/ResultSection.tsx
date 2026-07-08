import { useHomeContext } from "../hooks/useHome";
import { resultSectionVariants } from "../styles/ResultSection.style";
import BookList from "@/components/book/BookList";
import ResultCount from "@/components/resultcount/ResultCount";

const styles = resultSectionVariants();

const ResultSection = () => {
  const { result } = useHomeContext();

  return (
    <section className={styles.section()}>
      <ResultCount label="도서 검색 결과" count={result.data.meta.total_count} />
      {result.isSearching ? (
        <p role="status" className={styles.searching()}>
          검색 중입니다…
        </p>
      ) : (
        <BookList
          books={result.data.documents}
          isFavorite={result.favorite.isFavorite}
          onToggleFavorite={result.favorite.toggle}
          onLoadMore={result.fetchNextPage}
          hasMore={result.hasNextPage}
          empty="검색된 결과가 없습니다."
        />
      )}
    </section>
  );
};

export default ResultSection;
