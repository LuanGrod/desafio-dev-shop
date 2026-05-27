import { CheckoutHeader } from "./Header";
import { CheckoutSummary } from "./Summary";
import { ProductCard } from "../product/Card";
import type { CheckoutFlow } from "../../hook/checkout/useCheckoutFlow";

export function CheckoutPageView(props: CheckoutFlow) {
  return (
    <main className="min-h-screen bg-[#f5f5f2] px-4 py-6 text-zinc-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <CheckoutHeader />

        <div
          data-testid="checkout-shell"
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)] lg:items-start"
        >
          <ProductCard product={props.product} />
          <CheckoutSummary {...props} />
        </div>
      </section>
    </main>
  );
}
