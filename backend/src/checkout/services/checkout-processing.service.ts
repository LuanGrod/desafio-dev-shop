import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { OrderStatus } from '../../orders/domain/order-status.enum';
import { OrdersRepository } from '../../orders/repositories/orders.repository';
import { ProductsRepository } from '../../products/repositories/products.repository';

const DEFAULT_PROCESSING_DELAY_MS = 50;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_PROCESSING_TIMEOUT_MS = 1;
const DEFAULT_RETRY_DELAY_MS = 50;

const APPROVED_MESSAGE = 'Compra aprovada com sucesso.';
const INSUFFICIENT_STOCK_MESSAGE =
  'Não há estoque suficiente para essa quantidade.';
const ERP_TIMEOUT_MESSAGE =
  'Não foi possível processar o pedido após novas tentativas.';

@Injectable()
export class CheckoutProcessingService implements OnModuleDestroy {
  private readonly timers = new Set<NodeJS.Timeout>();

  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) { }

  schedule(orderId: number): void {
    this.scheduleWithDelay(
      orderId,
      this.readMilliseconds(
        'ERP_PROCESSING_DELAY_MS',
        DEFAULT_PROCESSING_DELAY_MS,
      ),
    );
  }

  process(orderId: number): void {
    const order = this.ordersRepository.findById(orderId);

    if (!order || order.status !== OrderStatus.PROCESSING) {
      return;
    }

    const processingAttempts = (order.processing_attempts ?? 0) + 1;
    this.ordersRepository.update(orderId, {
      processing_attempts: processingAttempts,
    });

    if (process.env.ERP_SIMULATE_TIMEOUT === 'true') {
      const maxRetries = this.readInteger(
        'ERP_MAX_RETRIES',
        DEFAULT_MAX_RETRIES,
      );

      if (processingAttempts <= maxRetries) {
        this.scheduleWithDelay(
          orderId,
          DEFAULT_PROCESSING_TIMEOUT_MS +
          this.readMilliseconds('ERP_RETRY_DELAY_MS', DEFAULT_RETRY_DELAY_MS),
        );
        return;
      }

      this.ordersRepository.update(orderId, {
        status: OrderStatus.REJECTED,
        message: ERP_TIMEOUT_MESSAGE,
        processing_attempts: processingAttempts,
      });
      return;
    }

    const [item] = order.items;

    if (
      !this.productsRepository.decrementStock(item.product_id, item.quantity)
    ) {
      this.ordersRepository.update(orderId, {
        status: OrderStatus.REJECTED,
        message: INSUFFICIENT_STOCK_MESSAGE,
        processing_attempts: processingAttempts,
      });
      return;
    }

    this.ordersRepository.update(orderId, {
      status: OrderStatus.APPROVED,
      message: APPROVED_MESSAGE,
      processing_attempts: processingAttempts,
    });
  }

  onModuleDestroy(): void {
    for (const timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  private scheduleWithDelay(orderId: number, delay: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      this.process(orderId);
    }, delay);
    this.timers.add(timer);
  }

  private readMilliseconds(name: string, defaultValue: number): number {
    const value = Number(process.env[name] ?? defaultValue);
    return Number.isFinite(value) && value >= 0 ? value : defaultValue;
  }

  private readInteger(name: string, defaultValue: number): number {
    const value = Number(process.env[name] ?? defaultValue);
    return Number.isInteger(value) && value >= 0 ? value : defaultValue;
  }
}
