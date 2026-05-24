import type { Route } from "./+types/checkout";
import { checkoutProduct } from "../checkout/product";

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Checkout | Case Cell Shop" },
    {
      name: "description",
      content: "Finalize a compra da sua capinha de celular.",
    },
  ];
}

export default function Checkout() {
  return (
    <main className="min-h-screen bg-[#f5f5f2] px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
          <p className="text-sm font-medium uppercase text-zinc-500">Checkout</p>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
                Finalize sua compra
              </h1>
              <p className="mt-3 text-base leading-7 text-zinc-600">
                Revise o produto, escolha a quantidade e acompanhe o status do
                pedido em uma tela simples e segura.
              </p>
            </div>
            <p className="text-sm font-medium text-zinc-500">Compra protegida</p>
          </div>
        </header>

        <div
          data-testid="checkout-shell"
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-start"
        >
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
                    {checkoutProduct.name}
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-7 text-zinc-600">
                    {checkoutProduct.description}
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-zinc-600 sm:grid-cols-3">
                  <div className="rounded-md border border-zinc-200 p-3">
                    <p className="font-medium text-zinc-950">
                      {priceFormatter.format(checkoutProduct.price)}
                    </p>
                    <p>Preço unitário</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 p-3">
                    <p className="font-medium text-zinc-950">
                      {checkoutProduct.stock} unidades
                    </p>
                    <p>Estoque disponível</p>
                  </div>
                  <div className="rounded-md border border-zinc-200 p-3">
                    <p className="font-medium text-zinc-950">iPhone 15</p>
                    <p>Compatibilidade</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside
            data-testid="summary-panel"
            aria-labelledby="checkout-summary-title"
            className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-sm font-medium text-zinc-500">Resumo</p>
                <h2
                  id="checkout-summary-title"
                  className="mt-1 text-xl font-semibold tracking-normal text-zinc-950"
                >
                  Sua compra
                </h2>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 p-3">
                <span className="text-sm font-medium text-zinc-600">Quantidade</span>
                <div className="flex items-center gap-3" aria-label="Quantidade selecionada">
                  <button
                    type="button"
                    disabled
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-lg font-medium text-zinc-400"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center text-base font-semibold text-zinc-950">
                    1
                  </span>
                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-lg font-medium text-zinc-950"
                  >
                    +
                  </button>
                </div>
              </div>

              <dl className="space-y-3 text-sm text-zinc-600">
                <div className="flex items-center justify-between gap-4">
                  <dt>Preço unitário</dt>
                  <dd className="font-medium text-zinc-950">
                    {priceFormatter.format(checkoutProduct.price)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt>Quantidade</dt>
                  <dd className="font-medium text-zinc-950">1</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 text-base">
                  <dt className="font-semibold text-zinc-950">Total</dt>
                  <dd className="font-semibold text-zinc-950">
                    {priceFormatter.format(checkoutProduct.price)}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                className="w-full rounded-md bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              >
                Finalizar compra
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
