import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { CheckoutModule } from './checkout/checkout.module';

@Module({
  imports: [OrdersModule, CheckoutModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
