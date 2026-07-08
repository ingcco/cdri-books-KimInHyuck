import { useState } from "react";
import { LOCAL_STORAGE_KEY } from "@/constants/localStorageKey";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

const MAX_HISTORY = 8;

// 검색 기록 상태 훅 — 중복이면 기존 제거 후 맨 앞 재추가(최신순), 최대 8개 유지.
const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>(() =>
    getLocalStorage<string[]>(LOCAL_STORAGE_KEY.SEARCH_HISTORY, [])
  );

  const add = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const next = [trimmed, ...history.filter((item) => item !== trimmed)].slice(0, MAX_HISTORY);
    setHistory(next);
    setLocalStorage(LOCAL_STORAGE_KEY.SEARCH_HISTORY, next);
  };

  const remove = (query: string) => {
    const next = history.filter((item) => item !== query);
    setHistory(next);
    setLocalStorage(LOCAL_STORAGE_KEY.SEARCH_HISTORY, next);
  };

  return { history, add, remove };
};

export { useSearchHistory };
