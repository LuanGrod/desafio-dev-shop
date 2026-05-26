import { Injectable } from '@nestjs/common';
import { CheckoutRequest } from '../domain/checkout-request.entity';

export interface IdempotencyEntry {
  key: string;
  payload_signature: string;
  order_id: number;
}

@Injectable()
export class IdempotencyRepository {
  private readonly entries = new Map<string, IdempotencyEntry>();

  findByKey(key: string): IdempotencyEntry | undefined {
    const entry = this.entries.get(key);
    return entry ? { ...entry } : undefined;
  }

  save(entry: IdempotencyEntry): IdempotencyEntry {
    const storedEntry = { ...entry };
    this.entries.set(storedEntry.key, storedEntry);
    return { ...storedEntry };
  }

  createPayloadSignature(payload: CheckoutRequest): string {
    return JSON.stringify({
      items: payload.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    });
  }

  reset(): void {
    this.entries.clear();
  }
}
