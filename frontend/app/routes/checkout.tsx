import { CheckoutPageView } from "../component/checkout/PageView";
import { checkoutProduct } from "../data/product";
import { useCheckoutFlow } from "../hook/checkout/useCheckoutFlow";
import type { Route } from "./+types/checkout";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Checkout | Case Cell Shop" },
    {
      name: "description",
      content: "Finalize a compra da sua capinha de celular.",
    },
  ];
}

export default function Checkout() {
  const checkout = useCheckoutFlow({ product: checkoutProduct });

  return <CheckoutPageView {...checkout} />;
}
