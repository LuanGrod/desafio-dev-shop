import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const idempotencyPath = resolve(__dirname, "../app/checkout/idempotency.ts");
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");

const idempotencySource = readFileSync(idempotencyPath, "utf8");
const checkoutSource = readFileSync(checkoutPath, "utf8");

assert.match(
  idempotencySource,
  /export function createCheckoutIdempotencyKey/,
  "checkout idempotency should expose a key creation function",
);

assert.match(
  idempotencySource,
  /crypto\?\.randomUUID\?\.\(\)/,
  "key creation should use crypto.randomUUID() when available",
);

assert.match(
  idempotencySource,
  /Math\.random\(\)/,
  "key creation should include a fallback for runtimes without crypto.randomUUID()",
);

assert.match(
  idempotencySource,
  /export function useCheckoutIdempotency/,
  "checkout idempotency should expose a centralized hook for the current attempt",
);

assert.match(
  idempotencySource,
  /currentKeyRef/,
  "the hook should keep the current idempotency key stable across renders",
);

assert.match(
  idempotencySource,
  /getOrCreateKey/,
  "the hook should centralize creating or reusing the current key",
);

assert.match(
  idempotencySource,
  /status === "APPROVED" \|\| status === "REJECTED"/,
  "the hook should clear the current key when an order reaches a final status",
);

assert.match(
  idempotencySource,
  /lastFinalizedItemsSignatureRef/,
  "the hook should track finalized item signatures to avoid reusing old keys for changed purchases",
);

assert.match(
  checkoutSource,
  /useCheckoutIdempotency/,
  "checkout page should use the idempotency mechanism",
);

assert.match(
  checkoutSource,
  /checkoutProduct\.id.*quantity/s,
  "checkout page should derive the current purchase signature from product id and quantity",
);
