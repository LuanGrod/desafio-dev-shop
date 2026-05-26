export interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
}
