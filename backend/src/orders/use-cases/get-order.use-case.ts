import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../domain/order-status.enum';
import { OrdersRepository } from '../repositories/orders.repository';

export class InvalidOrderIdError extends Error {
  constructor() {
    super('Informe um pedido válido.');
  }
}

export class OrderNotFoundError extends Error {
  constructor() {
    super('Pedido não encontrado.');
  }
}

export interface GetOrderOutput {
  order_id: number;
  status: OrderStatus;
  message: string;
}

@Injectable()
export class GetOrderUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) { }

  execute(orderId: number): GetOrderOutput {
    if (!Number.isInteger(orderId) || orderId <= 0) {
      throw new InvalidOrderIdError();
    }

    const order = this.ordersRepository.findById(orderId);

    if (!order) {
      throw new OrderNotFoundError();
    }

    return {
      order_id: order.order_id,
      status: order.status,
      message: order.message,
    };
  }
}
