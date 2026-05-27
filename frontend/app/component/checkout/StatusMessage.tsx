import type {
  CheckoutDisplayOrder,
  CheckoutMessageTone,
} from "../../utils/checkout/view-model";

const checkoutMessageToneClasses: Record<CheckoutMessageTone, string> = {
  processing: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
};

type CheckoutStatusMessageProps = {
  order: CheckoutDisplayOrder;
  tone: CheckoutMessageTone;
};

export function CheckoutStatusMessage({
  order,
  tone,
}: CheckoutStatusMessageProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-md border p-3 text-sm leading-6 ${checkoutMessageToneClasses[tone]}`}
    >
      {order.message}
    </div>
  );
}
