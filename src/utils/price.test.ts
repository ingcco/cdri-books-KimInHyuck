import { describe, expect, it } from "vitest";
import { resolveBookPrice } from "./price";

describe("resolveBookPrice — 카카오 sale_price -1 센티넬", () => {
  it("sale_price가 -1이면 할인 없음으로 보고 원가를 표시가로 쓴다", () => {
    expect(resolveBookPrice({ price: 10000, sale_price: -1 })).toEqual({
      hasSale: false,
      finalPrice: 10000,
    });
  });

  it("sale_price가 양수면 할인가로 취급한다", () => {
    expect(resolveBookPrice({ price: 10000, sale_price: 9000 })).toEqual({
      hasSale: true,
      finalPrice: 9000,
    });
  });

  it("sale_price 0(경계값)도 할인가로 취급한다", () => {
    expect(resolveBookPrice({ price: 10000, sale_price: 0 })).toEqual({
      hasSale: true,
      finalPrice: 0,
    });
  });
});
