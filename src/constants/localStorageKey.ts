export const LOCAL_STORAGE_KEY = {
  SEARCH_HISTORY: "search-history",
  FAVORITES: "favorites",
} as const;

export type LocalStorageKey = (typeof LOCAL_STORAGE_KEY)[keyof typeof LOCAL_STORAGE_KEY];
