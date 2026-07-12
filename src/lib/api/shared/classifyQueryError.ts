import axios from "axios";

const CRITICAL_STATUS = new Set([401, 403, 404, 503]);

export type QueryErrorKind = "critical" | "recoverable";

export const classifyQueryError = (error: unknown): QueryErrorKind => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  if (status !== undefined && (CRITICAL_STATUS.has(status) || status >= 500)) {
    return "critical";
  }
  return "recoverable";
};
