import type { CheckoutFlow } from "../../hook/checkout/useCheckoutFlow";
import {
  formatCheckoutPrice,
} from "../../utils/checkout/view-model";
import { CheckoutStatusMessage } from "./StatusMessage";
import { StepperBasic } from "../stepper/Basic";
import { SummaryRow } from "./SummaryRow";

export function CheckoutSummary({
  product,
  quantity,
  totalPrice,
  checkoutOrder,
  checkoutMessageTone,
  isSubmittingCheckout,
  isCheckoutButtonDisabled,
  canDecrementQuantity,
  incrementQuantity,
  decrementQuantity,
  submitCheckout,
}: CheckoutFlow) {
  const checkoutButtonLabel = checkoutOrder?.status === "PROCESSING"
    ? "Processando pedido..."
    : isSubmittingCheckout
      ? "Finalizando..."
      : "Finalizar compra";

  return (
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

        <StepperBasic
          quantity={quantity}
          canDecrementQuantity={canDecrementQuantity}
          canIncrementQuantity={true}
          incrementQuantity={incrementQuantity}
          decrementQuantity={decrementQuantity}
        />

        <dl className="space-y-3 text-sm text-zinc-600">
          <SummaryRow
            label="Preço unitário"
            value={formatCheckoutPrice(product.price)}
          />
          <SummaryRow label="Quantidade" value={String(quantity)} />
          <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 text-base">
            <dt className="font-semibold text-zinc-950">Total</dt>
            <dd className="font-semibold text-zinc-950">
              {formatCheckoutPrice(totalPrice)}
            </dd>
          </div>
        </dl>

        {checkoutOrder ? (
          <CheckoutStatusMessage
            order={checkoutOrder}
            tone={checkoutMessageTone}
          />
        ) : null}

        <button
          type="button"
          disabled={isCheckoutButtonDisabled}
          aria-disabled={isCheckoutButtonDisabled}
          onClick={submitCheckout}
          className="w-full rounded-md bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600 disabled:hover:bg-zinc-300"
        >
          {checkoutButtonLabel}
        </button>
      </div>
    </aside>
  );
}
