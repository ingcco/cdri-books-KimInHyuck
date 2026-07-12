export const toComma = (value: number, unit = ""): string =>
  `${value.toLocaleString("ko-KR")}${unit}`;
