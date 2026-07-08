import { AnimatePresence, m } from "framer-motion";
import { useHomeContext } from "../hooks/useHome";
import { useSearchInput } from "../hooks/useSearchInput";
import { searchFieldVariants } from "../styles/SearchField.style";
import CloseIcon from "@/assets/icons/close.svg";
import Search from "@/components/input/search/Search";
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
  const { inputRef, draft, activeIndex, isHistoryOpen, selectHistory, clear, inputHandler } =
    useSearchInput({
      initialValue: filters.target ? "" : filters.q,
      historyList: history.list,
      onSearch: searchBar.onSearch,
      onSelectHistory: history.select,
    });

  return (
    <div className={styles.searchArea()}>
      <Search
        ref={inputRef}
        // 히스토리 열림 시 pill 하단을 각지게 + 링 제거 → 아래 히스토리 박스와 하나로 이어짐
        containerClassName={
          isHistoryOpen ? "rounded-t-[24px] rounded-b-none focus-within:ring-0" : undefined
        }
        value={draft}
        placeholder="검색어를 입력하세요"
        suffix={
          draft ? (
            <button
              type="button"
              aria-label="검색어 지우기"
              className={styles.clear()}
              // onMouseDown preventDefault — 인풋 blur보다 먼저 클릭이 처리되게(포커스 유지)
              onMouseDown={(event) => event.preventDefault()}
              onClick={clear}
            >
              <CloseIcon aria-hidden="true" className="size-4" />
            </button>
          ) : null
        }
        onChange={inputHandler.onChange}
        onKeyDown={inputHandler.onKeyDown}
        onEnter={inputHandler.onEnter}
        onFocus={inputHandler.onFocus}
        onBlur={inputHandler.onBlur}
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
