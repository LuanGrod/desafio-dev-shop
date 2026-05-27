import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const idempotencySource = readFileSync(resolve(__dirname, "../app/utils/idempotency.ts"), "utf8");
const idempotencyHookSource = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutIdempotency.ts"), "utf8");
const hookSource = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutFlow.ts"), "utf8");
const viewModelSource = readFileSync(resolve(__dirname, "../app/utils/checkout/view-model.ts"), "utf8");

assert.match(idempotencySource, /export function createIdempotencyKey/, "checkout idempotency should expose a key creation function");
assert.match(idempotencySource, /crypto\?\.randomUUID\?\.\(\)/, "key creation should use crypto.randomUUID() when available");
assert.match(idempotencySource, /Math\.random\(\)/, "key creation should include a fallback for runtimes without crypto.randomUUID()");
assert.match(idempotencyHookSource, /export function useCheckoutIdempotency/, "checkout idempotency should expose a centralized hook for the current attempt");
assert.match(idempotencyHookSource, /currentKeyRef/, "the hook should keep the current idempotency key stable across renders");
assert.match(idempotencyHookSource, /getOrCreateKey/, "the hook should centralize creating or reusing the current key");
assert.match(idempotencyHookSource, /status === "APPROVED" \|\| status === "REJECTED"/, "the hook should clear the current key when an order reaches a final status");
assert.match(idempotencyHookSource, /lastFinalizedItemsSignatureRef/, "the hook should track finalized item signatures to avoid reusing old keys for changed purchases");
assert.match(hookSource, /useCheckoutIdempotency/, "checkout flow should use the idempotency mechanism");
assert.match(hookSource, /buildCheckoutItemsSignature\(product\.id,\s*quantity\)/, "checkout flow should derive the current purchase signature from product id and quantity");
assert.match(viewModelSource, /function buildCheckoutItemsSignature\(productId: number, quantity: number\)/, "checkout item signature helper should be centralized in the view-model");
