import { renderHook } from "@testing-library/react";
import type { KeyboardEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { useInput } from "./useInput";

const keyEvent = (key: string, isComposing: boolean) =>
  ({ key, nativeEvent: { isComposing } }) as unknown as KeyboardEvent<HTMLInputElement>;

describe("useInput — IME 조합 Enter 구분", () => {
  it("조합 확정 Enter(nativeEvent.isComposing)는 onEnter를 호출하지 않는다", () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useInput({ onEnter }));

    result.current.handleKeyDown(keyEvent("Enter", true));

    expect(onEnter).not.toHaveBeenCalled();
  });

  it("compositionStart 후 종료 전 Enter는 onEnter를 호출하지 않는다(ref 경로)", () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useInput({ onEnter }));

    result.current.handleCompositionStart();
    result.current.handleKeyDown(keyEvent("Enter", false));

    expect(onEnter).not.toHaveBeenCalled();
  });

  it("조합 종료(compositionEnd) 후 Enter는 onEnter를 호출한다", () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useInput({ onEnter }));

    result.current.handleCompositionStart();
    result.current.handleCompositionEnd();
    result.current.handleKeyDown(keyEvent("Enter", false));

    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it("Enter가 아닌 키는 onEnter를 호출하지 않는다", () => {
    const onEnter = vi.fn();
    const { result } = renderHook(() => useInput({ onEnter }));

    result.current.handleKeyDown(keyEvent("a", false));

    expect(onEnter).not.toHaveBeenCalled();
  });
});
