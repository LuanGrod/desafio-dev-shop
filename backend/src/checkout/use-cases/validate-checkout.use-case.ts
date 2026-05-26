import { Injectable } from '@nestjs/common';
import { CheckoutRequest } from '../domain/checkout-request.entity';
import { ProductsRepository } from '../../products/repositories/products.repository';

export class InvalidCheckoutPayloadError extends Error {
  constructor() {
    super('Dados da compra inválidos.');
  }
}

export class InvalidCheckoutQuantityError extends Error {
  constructor() {
    super('Informe uma quantidade válida.');
  }
}

@Injectable()
export class ValidateCheckoutUseCase {
  constructor(private readonly productsRepository: ProductsRepository) {}

  execute(payload: unknown): CheckoutRequest {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      throw new InvalidCheckoutPayloadError();
    }

    const items = (payload as Partial<CheckoutRequest>).items;

    if (!Array.isArray(items) || items.length === 0) {
      throw new InvalidCheckoutPayloadError();
    }

    const [item] = items;

    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new InvalidCheckoutPayloadError();
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new InvalidCheckoutQuantityError();
    }

    if (
      !Number.isInteger(item.product_id) ||
      !this.productsRepository.findById(item.product_id)
    ) {
      throw new InvalidCheckoutPayloadError();
    }

    return {
      items: [{ product_id: item.product_id, quantity: item.quantity }],
    };
  }
}
