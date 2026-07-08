import axios from "axios";

// 전역 쿼리 에러를 소비 시점에 분류한다 — HTTP status만으로 판정(사전 severity 클래스 미도입).
// 401/403/404/503 또는 5xx는 복구 불가로 보고 에러 페이지로, 나머지는 토스트로 회복시킨다.
const CRITICAL_STATUS = new Set([401, 403, 404, 503]);

export type QueryErrorKind = "critical" | "recoverable";

export const classifyQueryError = (error: unknown): QueryErrorKind => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status !== undefined && (CRITICAL_STATUS.has(status) || status >= 500)) {
    return "critical";
  }
  return "recoverable";
};
