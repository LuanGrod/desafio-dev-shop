import { OrderStatus } from './order-status.enum';

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface Order {
  order_id: number;
  status: OrderStatus;
  message: string;
  items: OrderItem[];
}
