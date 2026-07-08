import { AnimatePresence, m } from "framer-motion";
import { useHomeContext } from "../hooks/useHome";
import { searchFieldVariants } from "../styles/SearchField.style";
import CloseIcon from "@/assets/icons/close.svg";
import Search from "@/components/input/search/Search";
import { useSearchInput } from "@/hooks/useSearchInput";
import { animation } from "@/lib/animation/transition";

const styles = searchFieldVariants();

const SearchHistoryList = ({
  list,
  activeIndex,
  onSelect,
  onRemove,
}: {
  list: string[];
  activeIndex: number;
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
}) => {
  return (
    <m.ul {...animation.dropdown} className={styles.historyList()}>
      {list.map((item, index) => (
        <li
          key={item}
          className={styles.historyItem({
            className: index === activeIndex ? "bg-gray" : undefined,
          })}
        >
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
            <CloseIcon aria-hidden="true" className="size-4" />
          </button>
        </li>
      ))}
    </m.ul>
  );
};

const SearchField = () => {
  const { filters, searchBar, history } = useHomeContext();
  // 상호배타 — 상세검색(target) 활성 시 통합검색 입력은 비운다(HomePage의 key 리셋으로 재초기화)
  const { draft, setDraft, isFocused, setIsFocused, activeIndex, setActiveIndex } = useSearchInput(
    filters.target ? "" : filters.q
  );

  const isHistoryOpen = isFocused && history.list.length > 0;

  const selectHistory = (query: string) => {
    setDraft(query);
    history.select(query);
    setActiveIndex(-1);
  };

  return (
    <div className={styles.searchArea()}>
      <Search
        value={draft}
        placeholder="검색어를 입력하세요"
        onChange={(event) => {
          setDraft(event.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (!isHistoryOpen) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => Math.min(index + 1, history.list.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, -1));
          } else if (event.key === "Escape") {
            setIsFocused(false);
            setActiveIndex(-1);
          }
        }}
        onEnter={() => {
          const picked = activeIndex >= 0 ? history.list[activeIndex] : undefined;
          if (picked) selectHistory(picked);
          else searchBar.onSearch(draft);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setActiveIndex(-1);
        }}
      />
      <AnimatePresence>
        {isHistoryOpen && (
          <SearchHistoryList
            list={history.list}
            activeIndex={activeIndex}
            onSelect={selectHistory}
            onRemove={history.remove}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchField;
