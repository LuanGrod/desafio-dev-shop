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
  idempotency_key?: string;
  created_at?: Date;
  processing_attempts?: number;
}
