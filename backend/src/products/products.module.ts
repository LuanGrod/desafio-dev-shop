import { Module } from '@nestjs/common';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  providers: [ProductsRepository],
  exports: [ProductsRepository],
})
export class ProductsModule {}
