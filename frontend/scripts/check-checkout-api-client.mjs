import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiClientPath = resolve(__dirname, "../app/checkout/api.ts");
assert.ok(existsSync(apiClientPath), "checkout API client should exist at app/checkout/api.ts");
const source = readFileSync(apiClientPath, "utf8");

assert.match(
  source,
  /export type OrderStatus\s*=\s*"PROCESSING"\s*\|\s*"APPROVED"\s*\|\s*"REJECTED"/,
  "checkout API client should type the accepted order statuses",
);

assert.match(
  source,
  /export type CheckoutOrderResponse\s*=/,
  "checkout API client should type order responses",
);

for (const field of ["order_id", "status", "message"]) {
  assert.match(
    source,
    new RegExp(`${field}\\??:`),
    `checkout order response should include ${field}`,
  );
}

assert.match(
  source,
  /export async function postCheckout/,
  "checkout API client should export a POST /checkout function",
);

assert.match(
  source,
  /export async function getOrder/,
  "checkout API client should export a GET /orders/:order_id function",
);

assert.match(
  source,
  /method:\s*"POST"/,
  "POST /checkout should use the POST method",
);

assert.match(
  source,
  /\/checkout/,
  "POST /checkout should target the checkout endpoint",
);

assert.match(
  source,
  /items:\s*\[\s*\{\s*product_id:\s*productId,\s*quantity\s*\}\s*\]/s,
  "POST /checkout should send items with product_id and quantity",
);

assert.match(
  source,
  /"Content-Type":\s*"application\/json"/,
  "POST /checkout should send the JSON content type header",
);

assert.match(
  source,
  /"Idempotency-Key":\s*idempotencyKey/,
  "POST /checkout should send the idempotency key header",
);

assert.match(
  source,
  /JSON\.stringify/,
  "POST /checkout should serialize a JSON body",
);

assert.match(
  source,
  /\/orders\/\$\{encodeURIComponent\(String\(orderId\)\)\}/,
  "GET order should target /orders/:order_id with a URL-safe order id",
);

assert.match(
  source,
  /Não foi possível concluir a compra agora\. Tente novamente em instantes\./,
  "checkout API client should keep the local fallback message",
);

assert.match(
  source,
  /class CheckoutApiError extends Error/,
  "checkout API client should expose a dedicated error type",
);

assert.match(
  source,
  /throw new CheckoutApiError\(message/,
  "HTTP errors with useful API messages should preserve that message",
);

assert.match(
  source,
  /isSafeUserMessage/,
  "checkout API client should avoid exposing overly technical messages",
);
