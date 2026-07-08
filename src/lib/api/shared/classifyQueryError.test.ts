import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { classifyQueryError } from "./classifyQueryError";

const axiosError = (status?: number) => {
  const error = new AxiosError("요청 실패");
  if (status !== undefined) error.response = { status } as AxiosResponse;
  return error;
};

describe("classifyQueryError — 전역 에러 critical/recoverable 분류", () => {
  it.each([401, 403, 404, 503, 500, 502])("%d는 critical(에러 페이지)로 분류한다", (status) => {
    expect(classifyQueryError(axiosError(status))).toBe("critical");
  });

  it.each([400, 429])("%d는 recoverable(토스트)로 분류한다", (status) => {
    expect(classifyQueryError(axiosError(status))).toBe("recoverable");
  });

  it("응답 없는 네트워크 에러(status 없음)는 recoverable로 분류한다", () => {
    expect(classifyQueryError(axiosError(undefined))).toBe("recoverable");
  });

  it("axios 에러가 아닌 일반 에러는 recoverable로 분류한다", () => {
    expect(classifyQueryError(new Error("unknown"))).toBe("recoverable");
  });
});
