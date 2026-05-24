import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CHECKOUT_FALLBACK_ERROR_MESSAGE,
  CheckoutApiError,
  getOrder,
  postCheckout,
  type CheckoutOrderResponse,
} from "../checkout/api";
import { useCheckoutIdempotency } from "../checkout/idempotency";
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
  const [quantity, setQuantity] = useState(1);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutOrder, setCheckoutOrder] =
    useState<CheckoutOrderResponse | null>(null);
  const checkoutItemsSignature = `${checkoutProduct.id}:${quantity}`;
  const checkoutIdempotency = useCheckoutIdempotency(checkoutItemsSignature);
  const isOrderProcessing = checkoutOrder?.status === "PROCESSING";
  const isQuantityValid = quantity >= 1;
  const totalPrice = checkoutProduct.price * quantity;
  const isCheckoutButtonDisabled =
    !isQuantityValid || isSubmittingCheckout || isOrderProcessing;

  useEffect(() => {
    if (!checkoutOrder || checkoutOrder.status !== "PROCESSING") {
      return;
    }

    let isPollingActive = true;

    const pollOrderStatus = async () => {
      try {
        const order = await getOrder(checkoutOrder.order_id);

        if (!isPollingActive) {
          return;
        }

        setCheckoutOrder(order);
        checkoutIdempotency.syncAttemptStatus(order.status);

        if (order.status !== "PROCESSING") {
          clearInterval(pollingInterval);
        }
      } catch {
        if (!isPollingActive) {
          return;
        }

        clearInterval(pollingInterval);
        toast.error(CHECKOUT_FALLBACK_ERROR_MESSAGE);
      }
    };

    const pollingInterval = window.setInterval(pollOrderStatus, 2000);

    return () => {
      isPollingActive = false;
      clearInterval(pollingInterval);
    };
  }, [checkoutOrder, checkoutIdempotency]);

  const handleCheckoutSubmit = async () => {
    if (quantity < 1) {
      toast.error("Informe uma quantidade válida.");
      return;
    }

    if (isSubmittingCheckout || isOrderProcessing) {
      return;
    }

    const idempotencyKey = checkoutIdempotency.getOrCreateKey();

    try {
      setIsSubmittingCheckout(true);
      checkoutIdempotency.syncAttemptStatus("SENDING");

      const checkoutPromise = postCheckout({
        productId: checkoutProduct.id,
        quantity,
        idempotencyKey,
      });

      const order = await toast.promise(checkoutPromise, {
        loading: "Finalizando compra...",
        success: (order) => order.message,
        error: (error) =>
          error instanceof CheckoutApiError
            ? error.message
            : CHECKOUT_FALLBACK_ERROR_MESSAGE,
      });

      setCheckoutOrder(order);
      checkoutIdempotency.syncAttemptStatus(order.status);
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

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
                <div
                  data-testid="quantity-stepper"
                  className="flex items-center gap-3"
                  aria-label="Quantidade selecionada"
                >
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    disabled={quantity === 1}
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-lg font-medium text-zinc-950 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:border-zinc-200 disabled:hover:bg-white"
                  >
                    -
                  </button>
                  <span className="min-w-6 text-center text-base font-semibold text-zinc-950">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQuantity((current) => current + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-lg font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
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
                  <dd className="font-medium text-zinc-950">{quantity}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 text-base">
                  <dt className="font-semibold text-zinc-950">Total</dt>
                  <dd className="font-semibold text-zinc-950">
                    {priceFormatter.format(totalPrice)}
                  </dd>
                </div>
              </dl>

              {checkoutOrder ? (
                <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
                  <p className="font-medium text-zinc-950">
                    {checkoutOrder.status === "PROCESSING"
                      ? "Pedido em processamento"
                      : "Status do pedido"}
                  </p>
                  <p>{checkoutOrder.message}</p>
                </div>
              ) : null}

              <button
                type="button"
                disabled={isCheckoutButtonDisabled}
                aria-disabled={isCheckoutButtonDisabled}
                onClick={handleCheckoutSubmit}
                className="w-full rounded-md bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 disabled:hover:bg-zinc-300"
              >
                {isSubmittingCheckout ? "Finalizando..." : "Finalizar compra"}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
