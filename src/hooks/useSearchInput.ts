import { useCallback, useState } from "react";

// 검색 입력 버퍼(UI 상태) — Context를 타지 않도록 SearchBar 지역에서 호출.
// 실행된 검색어(filters.q)는 useHome이 소유하고, 입력 중 값은 여기에 격리한다.
export const useSearchInput = (initialValue: string) => {
  const [draft, setDraft] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const reset = useCallback(() => setDraft(""), []);

  return { draft, setDraft, isFocused, setIsFocused, reset };
};
