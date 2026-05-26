import { Module } from '@nestjs/common';
import { OrdersRepository } from './repositories/orders.repository';
import { OrdersController } from './orders.controller';
import { GetOrderUseCase } from './use-cases/get-order.use-case';

@Module({
  controllers: [OrdersController],
  providers: [OrdersRepository, GetOrderUseCase],
  exports: [OrdersRepository],
})
export class OrdersModule {}
