import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../../orders/domain/order-status.enum';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { CheckoutRequest } from '../domain/checkout-request.entity';
import { IdempotencyRepository } from '../repositories/idempotency.repository';
import { CheckoutProcessingService } from '../services/checkout-processing.service';

export class MissingIdempotencyKeyError extends Error {
  constructor() {
    super(
      'Não foi possível identificar a tentativa de compra. Tente novamente.',
    );
  }
}

export class IdempotencyPayloadMismatchError extends Error {
  constructor() {
    super('Dados da compra inválidos.');
  }
}

export class InsufficientStockError extends Error {
  constructor() {
    super('Não há estoque suficiente para essa quantidade.');
  }
}

export interface CreateCheckoutOrderOutput {
  order_id: number;
  status: OrderStatus;
  message: string;
}

const PROCESSING_MESSAGE = 'Pedido recebido e está sendo processado.';

@Injectable()
export class CreateCheckoutOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly checkoutProcessingService: CheckoutProcessingService,
  ) {}

  execute(
    payload: CheckoutRequest,
    idempotencyKey: string | undefined,
  ): CreateCheckoutOrderOutput {
    if (!idempotencyKey) {
      throw new MissingIdempotencyKeyError();
    }

    const payloadSignature =
      this.idempotencyRepository.createPayloadSignature(payload);
    const idempotencyEntry =
      this.idempotencyRepository.findByKey(idempotencyKey);

    if (idempotencyEntry) {
      if (idempotencyEntry.payload_signature !== payloadSignature) {
        throw new IdempotencyPayloadMismatchError();
      }

      const existingOrder = this.ordersRepository.findById(
        idempotencyEntry.order_id,
      );

      if (existingOrder) {
        return {
          order_id: existingOrder.order_id,
          status: existingOrder.status,
          message: existingOrder.message,
        };
      }
    }

    const [item] = payload.items;

    if (
      !this.productsRepository.hasSufficientStock(
        item.product_id,
        item.quantity,
      )
    ) {
      throw new InsufficientStockError();
    }

    const order = this.ordersRepository.create({
      status: OrderStatus.PROCESSING,
      message: PROCESSING_MESSAGE,
      items: payload.items,
      idempotency_key: idempotencyKey,
      created_at: new Date(),
    });

    this.idempotencyRepository.save({
      key: idempotencyKey,
      payload_signature: payloadSignature,
      order_id: order.order_id,
    });
    this.checkoutProcessingService.schedule(order.order_id);

    return {
      order_id: order.order_id,
      status: order.status,
      message: order.message,
    };
  }
}
