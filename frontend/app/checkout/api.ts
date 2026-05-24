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

type ApiErrorBody = {
  message?: unknown;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000")
  .replace(/\/$/, "");

export class CheckoutApiError extends Error {
  readonly status?: number;

  constructor(message = CHECKOUT_FALLBACK_ERROR_MESSAGE, status?: number) {
    super(message);
    this.name = "CheckoutApiError";
    this.status = status;
  }
}

function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

function isOrderStatus(status: unknown): status is OrderStatus {
  return status === "PROCESSING" || status === "APPROVED" || status === "REJECTED";
}

function isSafeUserMessage(message: unknown): message is string {
  if (typeof message !== "string") {
    return false;
  }

  const trimmedMessage = message.trim();
  const technicalPattern =
    /(?:stack trace|exception|syntaxerror|referenceerror|typeerror|typeorm|prisma|nestjs|internal server error|^error:|\bat\s+\S+\s+\()/i;

  return (
    trimmedMessage.length > 0 &&
    trimmedMessage.length <= 220 &&
    !technicalPattern.test(trimmedMessage)
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractUserMessage(body: unknown) {
  const message = (body as ApiErrorBody | null)?.message;

  return isSafeUserMessage(message)
    ? message.trim()
    : CHECKOUT_FALLBACK_ERROR_MESSAGE;
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
    const message = extractUserMessage(body);
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
