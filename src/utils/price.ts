// 카카오 도서 가격 규칙: sale_price가 -1이면 할인 없음 → 원가를 표시가로 쓴다.
// 검색·찜 두 화면이 공유하는 표시 규칙을 한 곳에 모은다(도메인 규칙 SOT).
export interface BookPrice {
  price: number;
  sale_price: number;
}

export const resolveBookPrice = (book: BookPrice): { hasSale: boolean; finalPrice: number } => {
  const hasSale = book.sale_price >= 0;
  return { hasSale, finalPrice: hasSale ? book.sale_price : book.price };
};
