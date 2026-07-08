// 라우트 경로 상수 — 경로 문자열의 SOT.
// 권한/가드가 없는 2라우트 규모라 path만 보관(role/guard 필드 없음).
export const ROUTES = {
  home: "/",
  favorites: "/favorites",
  error: "/error",
} as const;
