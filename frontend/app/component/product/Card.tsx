import { formatCheckoutPrice } from "../../utils/checkout/view-model";
import { ProductFact } from "./Fact";

type CheckoutProductView = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
};

type ProductCardProps = {
  product: CheckoutProductView;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <section
      data-testid="product-panel"
      aria-labelledby="checkout-product-title"
      className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-center">
        <div className="flex aspect-square items-center justify-center rounded-md border border-zinc-200 bg-zinc-100">
          <div className="h-36 w-20 rounded-3xl border-4 border-zinc-300 bg-white shadow-inner">
            <div className="mx-auto mt-3 h-4 w-4 rounded-full border border-zinc-300" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500">Produto</p>
            <h2
              id="checkout-product-title"
              className="mt-1 text-2xl font-semibold tracking-normal text-zinc-950"
            >
              {product.name}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-zinc-600">
              {product.description}
            </p>
          </div>

          <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
            {/* esses cards poderiam vir de fora também mas como é um exemplo simples, deixei fixo aqui */}
            <ProductFact
              label="Preço unitário"
              value={formatCheckoutPrice(product.price)}
            />
            <ProductFact
              label="Estoque disponível"
              value={`${product.stock} unidades`}
            />
            <ProductFact label="Compatibilidade" value="iPhone 15" />
          </div>
        </div>
      </div>
    </section>
  );
}
