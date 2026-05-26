import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  CreateCheckoutOrderUseCase,
  IdempotencyPayloadMismatchError,
  InsufficientStockError,
  MissingIdempotencyKeyError,
} from './use-cases/create-checkout-order.use-case';
import {
  InvalidCheckoutPayloadError,
  InvalidCheckoutQuantityError,
  ValidateCheckoutUseCase,
} from './use-cases/validate-checkout.use-case';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly validateCheckoutUseCase: ValidateCheckoutUseCase,
    private readonly createCheckoutOrderUseCase: CreateCheckoutOrderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  createCheckout(
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Body() body: unknown,
  ) {
    try {
      const payload = this.validateCheckoutUseCase.execute(body);
      return this.createCheckoutOrderUseCase.execute(payload, idempotencyKey);
    } catch (error) {
      if (error instanceof MissingIdempotencyKeyError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (
        error instanceof InvalidCheckoutPayloadError ||
        error instanceof InvalidCheckoutQuantityError ||
        error instanceof IdempotencyPayloadMismatchError
      ) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (error instanceof InsufficientStockError) {
        throw new HttpException(
          { message: error.message },
          HttpStatus.CONFLICT,
        );
      }

      throw error;
    }
  }
}
