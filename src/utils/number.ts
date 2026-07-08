// 천 단위 구분자 + 단위 접미. 예: toComma(16000, "원") -> "16,000원"
export const toComma = (value: number, unit = ""): string =>
  `${value.toLocaleString("ko-KR")}${unit}`;
