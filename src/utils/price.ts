export interface BookPrice {
  price: number;
  sale_price: number;
}

export const resolveBookPrice = (book: BookPrice): { hasSale: boolean; finalPrice: number } => {
  const hasSale = book.sale_price >= 0;
  return { hasSale, finalPrice: hasSale ? book.sale_price : book.price };
};
