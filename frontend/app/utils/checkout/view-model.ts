import { GenericApiError } from "../api";
import {
  CHECKOUT_FALLBACK_ERROR_MESSAGE,
  type CheckoutOrderResponse,
} from "./api";

export type CheckoutMessageTone = "processing" | "success" | "rejected" | "error";

export type CheckoutDisplayOrder =
  | CheckoutOrderResponse
  | {
    order_id: null;
    status: "ERROR";
    message: string;
  };

type PricedProduct = {
  price: number;
};

type CheckoutButtonState = {
  isQuantityValid: boolean;
  isSubmittingCheckout: boolean;
  isOrderProcessing: boolean;
};

const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function buildCheckoutItemsSignature(productId: number, quantity: number) {
  return `${productId}:${quantity}`;
}

export function calculateCheckoutTotal(product: PricedProduct, quantity: number) {
  return product.price * quantity;
}

export function formatCheckoutPrice(value: number) {
  return priceFormatter.format(value);
}

export function getCheckoutQuantityStatus(quantity: number) {
  return {
    isValid: quantity >= 1,
    canDecrement: quantity > 1,
  };
}

export function getCheckoutButtonDisabled({
  isQuantityValid,
  isSubmittingCheckout,
  isOrderProcessing,
}: CheckoutButtonState) {
  return !isQuantityValid || isSubmittingCheckout || isOrderProcessing;
}

export function getCheckoutMessageTone(
  checkoutOrder: CheckoutDisplayOrder,
): CheckoutMessageTone {
  if (checkoutOrder.status === "PROCESSING") {
    return "processing";
  }

  if (checkoutOrder.status === "APPROVED") {
    return "success";
  }

  if (checkoutOrder.status === "REJECTED") {
    return "rejected";
  }

  return "error";
}

export function toCheckoutErrorOrder(error?: unknown): CheckoutDisplayOrder {
  return {
    order_id: null,
    status: "ERROR",
    message:
      error instanceof GenericApiError
        ? error.message
        : CHECKOUT_FALLBACK_ERROR_MESSAGE,
  };
}

export function createInvalidQuantityOrder(): CheckoutDisplayOrder {
  return {
    order_id: null,
    status: "ERROR",
    message: "Informe uma quantidade válida.",
  };
}
