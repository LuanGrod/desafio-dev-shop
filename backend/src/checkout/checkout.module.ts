import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { CheckoutController } from './checkout.controller';
import { IdempotencyRepository } from './repositories/idempotency.repository';
import { CheckoutProcessingService } from './services/checkout-processing.service';
import { CreateCheckoutOrderUseCase } from './use-cases/create-checkout-order.use-case';
import { ValidateCheckoutUseCase } from './use-cases/validate-checkout.use-case';

@Module({
  imports: [OrdersModule, ProductsModule],
  controllers: [CheckoutController],
  providers: [
    IdempotencyRepository,
    CheckoutProcessingService,
    ValidateCheckoutUseCase,
    CreateCheckoutOrderUseCase,
  ],
  exports: [IdempotencyRepository],
})
export class CheckoutModule {}
