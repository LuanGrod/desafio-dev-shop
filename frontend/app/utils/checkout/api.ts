import { buildApiUrl, extractUserMessage, GenericApiError, isSafeUserMessage, readJson, type ApiErrorBody } from "~/utils/api";

export const CHECKOUT_FALLBACK_ERROR_MESSAGE =
  "Não foi possível concluir a compra agora. Tente novamente em instantes.";

export type OrderStatus = "PROCESSING" | "APPROVED" | "REJECTED";

export type CheckoutOrderResponse = {
  order_id: number;
  status: OrderStatus;
  message: string;
};

type PostCheckoutParams = {
  productId: number;
  quantity: number;
  idempotencyKey: string;
};


export class CheckoutApiError extends GenericApiError {
  constructor(message = CHECKOUT_FALLBACK_ERROR_MESSAGE, status?: number) {
    super("CheckoutApiError", message, status);
  }
}

function isOrderStatus(status: unknown): status is OrderStatus {
  return status === "PROCESSING" || status === "APPROVED" || status === "REJECTED";
}

function parseOrderResponse(body: unknown): CheckoutOrderResponse | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const order = body as Partial<CheckoutOrderResponse>;

  if (
    typeof order.order_id !== "number" ||
    !isOrderStatus(order.status) ||
    !isSafeUserMessage(order.message)
  ) {
    return null;
  }

  return {
    order_id: order.order_id,
    status: order.status,
    message: order.message.trim(),
  };
}

async function requestOrder(path: string, init?: RequestInit) {
  let response: Response;

  try {
    response = await fetch(buildApiUrl(path), init);
  } catch {
    throw new CheckoutApiError(CHECKOUT_FALLBACK_ERROR_MESSAGE);
  }

  const body = await readJson(response);

  if (!response.ok) {
    const message = extractUserMessage(body, CHECKOUT_FALLBACK_ERROR_MESSAGE);
    throw new CheckoutApiError(message, response.status);
  }

  const order = parseOrderResponse(body);

  if (!order) {
    throw new CheckoutApiError(CHECKOUT_FALLBACK_ERROR_MESSAGE, response.status);
  }

  return order;
}

export async function postCheckout({
  productId,
  quantity,
  idempotencyKey,
}: PostCheckoutParams) {
  return requestOrder("/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      items: [{ product_id: productId, quantity }],
    }),
  });
}

export async function getOrder(orderId: number | string) {
  return requestOrder(`/orders/${encodeURIComponent(String(orderId))}`);
}
