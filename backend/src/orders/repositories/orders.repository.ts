import { Injectable } from '@nestjs/common';
import { Order } from '../domain/order.entity';

@Injectable()
export class OrdersRepository {
  private readonly orders = new Map<number, Order>();

  findById(orderId: number): Order | undefined {
    const order = this.orders.get(orderId);
    return order ? this.clone(order) : undefined;
  }

  save(order: Order): Order {
    const storedOrder = this.clone(order);
    this.orders.set(storedOrder.order_id, storedOrder);
    return this.clone(storedOrder);
  }

  reset(): void {
    this.orders.clear();
  }

  private clone(order: Order): Order {
    return {
      ...order,
      items: order.items.map((item) => ({ ...item })),
    };
  }
}
