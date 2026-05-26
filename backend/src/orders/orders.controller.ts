import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import type { GetOrderOutput } from './use-cases/get-order.use-case';
import {
  GetOrderUseCase,
  InvalidOrderIdError,
  OrderNotFoundError,
} from './use-cases/get-order.use-case';

@Controller('orders')
export class OrdersController {
  constructor(private readonly getOrderUseCase: GetOrderUseCase) {}

  @Get(':order_id')
  getOrder(@Param('order_id') orderIdParam: string): GetOrderOutput {
    const orderId = Number(orderIdParam);

    try {
      return this.getOrderUseCase.execute(orderId);
    } catch (error) {
      if (error instanceof InvalidOrderIdError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof OrderNotFoundError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.NOT_FOUND,
        );
      }

      throw error;
    }
  }
}
