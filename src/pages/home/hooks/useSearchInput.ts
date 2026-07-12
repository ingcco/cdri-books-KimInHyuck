import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

interface UseSearchInputParams {
  initialValue: string;
  historyList: string[];
  onSearch: (query: string) => void;
  onSelectHistory: (query: string) => void;
}

export const useSearchInput = ({
  initialValue,
  historyList,
  onSearch,
  onSelectHistory,
}: UseSearchInputParams) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // 외부(URL) 검색어가 바뀌면(로고·뒤로가기로 q 비움 / 검색 실행 / 통합↔상세 전환) 입력 버퍼를 동기화한다.
  // effect도 key 리마운트도 아닌, 이전 값을 state로 들고 렌더 중 비교해 조정하는 React 공식 패턴.
  const [prevInitial, setPrevInitial] = useState(initialValue);
  if (prevInitial !== initialValue) {
    setPrevInitial(initialValue);
    setDraft(initialValue);
    setActiveIndex(-1);
  }

  const isHistoryOpen = isFocused && historyList.length > 0;

  const selectHistory = (query: string) => {
    setDraft(query);
    onSelectHistory(query);
    setActiveIndex(-1);
  };

  const clear = () => {
    setDraft("");
    inputRef.current?.focus();
  };

  const inputHandler = {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setDraft(event.target.value);
      setActiveIndex(-1);
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      // Esc: type="search" 네이티브 값 삭제를 막고(preventDefault) 히스토리 popover만 닫는다(값 보존).
      if (event.key === "Escape") {
        event.preventDefault();
        setIsFocused(false);
        setActiveIndex(-1);
        return;
      }
      if (!isHistoryOpen) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, historyList.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, -1));
      }
    },
    onEnter: () => {
      const picked = activeIndex >= 0 ? historyList[activeIndex] : undefined;
      if (picked) selectHistory(picked);
      else onSearch(draft);
      inputRef.current?.blur();
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => {
      setIsFocused(false);
      setActiveIndex(-1);
    },
  };

  return { inputRef, draft, activeIndex, isHistoryOpen, selectHistory, clear, inputHandler };
};
