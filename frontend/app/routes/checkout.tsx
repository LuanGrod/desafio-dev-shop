import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

type CheckoutMessageTone = "processing" | "success" | "rejected" | "error";
type CheckoutDisplayOrder =
  | CheckoutOrderResponse
  | {
      order_id: null;
      status: "ERROR";
      message: string;
    };

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const checkoutMessageToneClasses: Record<CheckoutMessageTone, string> = {
  processing: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

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
  const isCheckoutSubmitLockedRef = useRef(false);
  const [checkoutOrder, setCheckoutOrder] =
    useState<CheckoutDisplayOrder | null>(null);
  const checkoutItemsSignature = `${checkoutProduct.id}:${quantity}`;
  const checkoutIdempotency = useCheckoutIdempotency(checkoutItemsSignature);
  const isOrderProcessing = checkoutOrder?.status === "PROCESSING";
  const isQuantityValid = quantity >= 1;
  const totalPrice = checkoutProduct.price * quantity;
  const isCheckoutButtonDisabled =
    !isQuantityValid || isSubmittingCheckout || isOrderProcessing;
  const checkoutMessageTone: CheckoutMessageTone =
    checkoutOrder?.status === "PROCESSING"
      ? "processing"
      : checkoutOrder?.status === "APPROVED"
        ? "success"
        : checkoutOrder?.status === "REJECTED"
          ? "rejected"
          : "error";

  const processingOrderId =
    checkoutOrder?.status === "PROCESSING" ? checkoutOrder.order_id : null;
  const orderStatusQuery = useQuery({
    queryKey: ["checkout-order", processingOrderId],
    queryFn: () => getOrder(processingOrderId ?? ""),
    enabled: Boolean(processingOrderId) && isOrderProcessing,
    refetchInterval: (query) => {
      const order = query.state.data;

      return order?.status === "PROCESSING" ? 2000 : false;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: postCheckout,
    onSuccess: (order) => {
      setCheckoutOrder(order);
      checkoutIdempotency.syncAttemptStatus(order.status);
    },
    onError: (error) => {
      checkoutIdempotency.syncAttemptStatus("FAILED");
      setCheckoutOrder({
        order_id: null,
        status: "ERROR",
        message:
          error instanceof CheckoutApiError
            ? error.message
            : CHECKOUT_FALLBACK_ERROR_MESSAGE,
      });
    },
    onSettled: () => {
      isCheckoutSubmitLockedRef.current = false;
      setIsSubmittingCheckout(false);
    },
  });

  useEffect(() => {
    if (!orderStatusQuery.data) {
      return;
    }

    setCheckoutOrder(orderStatusQuery.data);
    checkoutIdempotency.syncAttemptStatus(orderStatusQuery.data.status);
  }, [orderStatusQuery.data, checkoutIdempotency]);

  useEffect(() => {
    if (!orderStatusQuery.error || !isOrderProcessing) {
      return;
    }

    checkoutIdempotency.syncAttemptStatus("FAILED");
    setCheckoutOrder({
      order_id: null,
      status: "ERROR",
      message: CHECKOUT_FALLBACK_ERROR_MESSAGE,
    });
  }, [orderStatusQuery.error, isOrderProcessing, checkoutIdempotency]);

  const handleCheckoutSubmit = async () => {
    if (quantity < 1) {
      setCheckoutOrder({
        order_id: null,
        status: "ERROR",
        message: "Informe uma quantidade válida.",
      });
      return;
    }

    if (
      isCheckoutSubmitLockedRef.current ||
      isSubmittingCheckout ||
      isOrderProcessing
    ) {
      return;
    }

    isCheckoutSubmitLockedRef.current = true;
    const idempotencyKey = checkoutIdempotency.getOrCreateKey();

    setIsSubmittingCheckout(true);
    setCheckoutOrder(null);
    checkoutIdempotency.syncAttemptStatus("SENDING");

    checkoutMutation.mutate({
      productId: checkoutProduct.id,
      quantity,
      idempotencyKey,
    });
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
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-md border p-3 text-sm leading-6 ${
                    checkoutMessageToneClasses[checkoutMessageTone]
                  }`}
                >
                  {checkoutOrder.message}
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
