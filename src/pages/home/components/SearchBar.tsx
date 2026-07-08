import { useEffect } from "react";
import { useHomeContext } from "../hooks/useHome";
import { searchBarVariants } from "../styles/SearchBar.style";
import DetailSearchPopover from "./DetailSearchPopover";
import Button from "@/components/button/Button";
import Search from "@/components/input/search/Search";
import { useSearchInput } from "@/hooks/useSearchInput";

const styles = searchBarVariants();

const SearchHistoryList = ({
  list,
  onSelect,
  onRemove,
}: {
  list: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
}) => {
  return (
    <ul className={styles.historyList()}>
      {list.map((item) => (
        <li key={item} className={styles.historyItem()}>
          {/* onMouseDown preventDefault — 인풋 blur보다 먼저 클릭이 처리되게 */}
          <button
            type="button"
            className={styles.historyLabel()}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
          <button
            type="button"
            aria-label={`검색 기록 삭제: ${item}`}
            className={styles.historyRemove()}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onRemove(item)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
};

const SearchBar = () => {
  const { filters, searchBar, history } = useHomeContext();
  const { draft, setDraft, isFocused, setIsFocused, reset } = useSearchInput(filters.q);

  // 상세검색 실행 시 메인 입력 초기화(상호배타)
  useEffect(() => {
    if (filters.target) reset();
  }, [filters.target, reset]);

  const selectHistory = (query: string) => {
    setDraft(query);
    history.select(query);
  };

  return (
    <div className={styles.wrapper()}>
      <div className={styles.searchArea()}>
        <Search
          value={draft}
          placeholder="검색어를 입력하세요"
          onChange={(event) => setDraft(event.target.value)}
          onEnter={() => searchBar.onSearch(draft)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {isFocused && history.list.length > 0 && (
          <SearchHistoryList
            list={history.list}
            onSelect={selectHistory}
            onRemove={history.remove}
          />
        )}
      </div>
      <div className={styles.detailArea()}>
        <Button buttonType="outline" size="sm" onClick={searchBar.openDetail}>
          상세검색
        </Button>
        <DetailSearchPopover />
      </div>
    </div>
  );
};

export default SearchBar;
