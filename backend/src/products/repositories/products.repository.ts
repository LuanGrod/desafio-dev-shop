import { Injectable } from '@nestjs/common';
import { Product } from '../domain/product.entity';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Capinha Clear Case iPhone 15',
    price: 79.9,
    stock: 5,
  },
];

@Injectable()
export class ProductsRepository {
  private products = new Map<number, Product>();

  constructor() {
    this.reset();
  }

  findById(productId: number): Product | undefined {
    const product = this.products.get(productId);
    return product ? { ...product } : undefined;
  }

  hasSufficientStock(productId: number, quantity: number): boolean {
    const product = this.products.get(productId);
    return Boolean(product && product.stock >= quantity);
  }

  decrementStock(productId: number, quantity: number): Product | undefined {
    const product = this.products.get(productId);

    if (!product || product.stock < quantity) {
      return undefined;
    }

    const updatedProduct = {
      ...product,
      stock: product.stock - quantity,
    };
    this.products.set(productId, updatedProduct);
    return { ...updatedProduct };
  }

  reset(products: Product[] = INITIAL_PRODUCTS): void {
    this.products = new Map(
      products.map((product) => [product.id, { ...product }]),
    );
  }
}
