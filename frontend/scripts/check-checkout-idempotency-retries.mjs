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
  /activeAttemptStatusRef/,
  "idempotency should track whether the current key belongs to an active attempt",
);

assert.match(
  idempotencySource,
  /type CheckoutAttemptStatus = "SENDING" \| "PROCESSING" \| "FAILED" \| FinalOrderStatus/,
  "idempotency should model failed attempts as inactive retries that can rotate on payload changes",
);

assert.match(
  idempotencySource,
  /currentKeyItemsSignatureRef/,
  "idempotency should track which item signature owns the current key",
);

assert.match(
  idempotencySource,
  /currentKeyItemsSignatureRef\.current !== itemsSignature[\s\S]*activeAttemptStatusRef\.current !== "SENDING"[\s\S]*activeAttemptStatusRef\.current !== "PROCESSING"/,
  "idempotency should rotate the key when the payload changes outside an active attempt",
);

assert.match(
  idempotencySource,
  /status === "APPROVED" \|\| status === "REJECTED"[\s\S]*currentKeyRef\.current = null[\s\S]*currentKeyItemsSignatureRef\.current = null/s,
  "idempotency should clear the key and its payload signature on final order statuses",
);

assert.match(
  checkoutSource,
  /isCheckoutSubmitLockedRef/,
  "checkout submit should use a synchronous lock to block repeated clicks during submission",
);

assert.match(
  checkoutSource,
  /isCheckoutSubmitLockedRef\.current[\s\S]*isSubmittingCheckout[\s\S]*isOrderProcessing/,
  "checkout submit guard should include the synchronous lock and existing disabled states",
);

assert.match(
  checkoutSource,
  /isCheckoutSubmitLockedRef\.current = true[\s\S]*checkoutMutation\.mutate/,
  "checkout submit should lock before starting the POST mutation",
);

assert.match(
  checkoutSource,
  /onSettled:[\s\S]*isCheckoutSubmitLockedRef\.current = false[\s\S]*setIsSubmittingCheckout\(false\)/,
  "checkout submit should release the synchronous lock after the POST mutation settles",
);

assert.match(
  checkoutSource,
  /checkoutIdempotency\.syncAttemptStatus\("FAILED"\)/,
  "checkout should mark failed POST or polling attempts as retryable but inactive",
);
