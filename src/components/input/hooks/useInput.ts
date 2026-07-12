import { useRef } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";

interface UseInputParams {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
  onEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const useInput = (params: UseInputParams) => {
  const { onChange, onKeyDown, onEnter } = params;

  // IME 조합 진행 여부(compositionstart~end). 조합 확정 Enter 중복 실행 방지에 사용
  const isComposingRef = useRef(false);

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.key !== "Enter") return;
    // 한글 조합을 확정하는 Enter는 검색 실행으로 취급하지 않음(확정+실행 중복 방지)
    if (event.nativeEvent.isComposing || isComposingRef.current) return;
    onEnter?.(event);
  };

  return { handleChange, handleKeyDown, handleCompositionStart, handleCompositionEnd };
};

export { useInput };
