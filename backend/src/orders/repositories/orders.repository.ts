import { Injectable } from '@nestjs/common';
import { Order } from '../domain/order.entity';

@Injectable()
export class OrdersRepository {
  private readonly orders = new Map<number, Order>();
  private nextOrderId = 1;

  findById(orderId: number): Order | undefined {
    const order = this.orders.get(orderId);
    return order ? this.clone(order) : undefined;
  }

  save(order: Order): Order {
    const storedOrder = this.clone(order);
    this.orders.set(storedOrder.order_id, storedOrder);
    this.nextOrderId = Math.max(this.nextOrderId, storedOrder.order_id + 1);
    return this.clone(storedOrder);
  }

  create(order: Omit<Order, 'order_id'>): Order {
    const createdOrder = {
      ...order,
      order_id: this.nextOrderId,
    };
    this.nextOrderId += 1;
    return this.save(createdOrder);
  }

  update(
    orderId: number,
    changes: Partial<Omit<Order, 'order_id'>>,
  ): Order | undefined {
    const order = this.orders.get(orderId);

    if (!order) {
      return undefined;
    }

    const updatedOrder = this.clone({
      ...order,
      ...changes,
      order_id: order.order_id,
      items: changes.items ?? order.items,
    });
    this.orders.set(orderId, updatedOrder);
    return this.clone(updatedOrder);
  }

  reset(): void {
    this.orders.clear();
    this.nextOrderId = 1;
  }

  private clone(order: Order): Order {
    return {
      ...order,
      created_at: order.created_at ? new Date(order.created_at) : undefined,
      items: order.items.map((item) => ({ ...item })),
    };
  }
}
