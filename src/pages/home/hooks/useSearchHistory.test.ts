import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSearchHistory } from "./useSearchHistory";
import { LOCAL_STORAGE_KEY } from "@/constants/localStorageKey";

// 검색어마다 별도 act로 감싸 리렌더를 유발한다 — add는 렌더 시점 history 클로저를 읽으므로
// 실제 사용(사용자 입력=개별 이벤트=개별 렌더)과 동일하게 렌더 사이에 상태가 누적된다.
const read = () =>
  JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY.SEARCH_HISTORY) ?? "[]") as string[];

describe("useSearchHistory", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("중복 검색어는 기존 항목을 제거하고 최신순 맨 앞으로 재정렬한다", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => result.current.add("리액트"));
    act(() => result.current.add("타입스크립트"));
    act(() => result.current.add("리액트"));

    expect(result.current.history).toEqual(["리액트", "타입스크립트"]);
  });

  it("최대 8개만 유지하고 초과 시 가장 오래된 검색어를 밀어낸다", () => {
    const { result } = renderHook(() => useSearchHistory());

    for (let i = 1; i <= 9; i += 1) {
      act(() => result.current.add(`검색어${i}`));
    }

    expect(result.current.history).toHaveLength(8);
    expect(result.current.history[0]).toBe("검색어9");
    expect(result.current.history).not.toContain("검색어1");
  });

  it("빈/공백 검색어는 기록하지 않고, 저장 시 trim한다", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => result.current.add("  리액트  "));
    act(() => result.current.add("   "));
    act(() => result.current.add(""));

    expect(result.current.history).toEqual(["리액트"]);
  });

  it("remove는 해당 검색어만 제거한다", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => result.current.add("리액트"));
    act(() => result.current.add("타입스크립트"));
    act(() => result.current.remove("리액트"));

    expect(result.current.history).toEqual(["타입스크립트"]);
  });

  it("변경을 localStorage에 반영해 재방문 시 복원된다", () => {
    const { result } = renderHook(() => useSearchHistory());

    act(() => result.current.add("리액트"));

    expect(read()).toEqual(["리액트"]);
  });
});
