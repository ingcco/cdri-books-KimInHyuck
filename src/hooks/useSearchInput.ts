import { useState } from "react";

// 검색 입력 버퍼(UI 상태) — Context를 타지 않도록 컴포넌트 지역에서 호출.
// 실행된 검색어(filters.q)는 useHome이 소유하고, 입력 중 값은 여기에 격리한다.
// activeIndex: 검색 기록 방향키 네비게이션 하이라이트 인덱스(-1 = 없음).
export const useSearchInput = (initialValue: string) => {
  const [draft, setDraft] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  return { draft, setDraft, isFocused, setIsFocused, activeIndex, setActiveIndex };
};
