import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const source = readFileSync(checkoutPath, "utf8");

assert.match(
  source,
  /import\s+\{\s*(?:CheckoutApiError,\s*)?postCheckout|import\s+\{[^}]*postCheckout[^}]*\}/,
  "checkout page should import the POST checkout client",
);

assert.match(
  source,
  /const\s+\[isSubmittingCheckout,\s*setIsSubmittingCheckout\]\s*=\s*useState\(false\)/,
  "checkout page should track when the POST checkout request is being sent",
);

assert.match(
  source,
  /const\s+\[checkoutOrder,\s*setCheckoutOrder\]/,
  "checkout page should store the order returned by the checkout API",
);

assert.match(
  source,
  /const\s+handleCheckoutSubmit\s*=\s*async\s*\(\)/,
  "checkout page should define an async submit handler for checkout",
);

assert.match(
  source,
  /import\s+toast\s+from\s+"react-hot-toast"/,
  "checkout page should import the react-hot-toast dispatcher",
);

assert.match(
  source,
  /if\s*\(quantity\s*<\s*1\)\s*\{[\s\S]*toast\.error\("Informe uma quantidade válida\."\)[\s\S]*return;/,
  "checkout submit should block invalid local quantity and show a toast message",
);

assert.match(
  source,
  /if\s*\(isSubmittingCheckout\s*\|\|\s*isOrderProcessing\)\s*\{\s*return;\s*\}/,
  "checkout submit should prevent repeated attempts while sending or processing",
);

assert.match(
  source,
  /const\s+idempotencyKey\s*=\s*checkoutIdempotency\.getOrCreateKey\(\)/,
  "checkout submit should create or reuse the current idempotency key",
);

assert.match(
  source,
  /postCheckout\(\{[\s\S]*productId:\s*checkoutProduct\.id,[\s\S]*quantity,[\s\S]*idempotencyKey,[\s\S]*\}\)/,
  "checkout submit should call POST /checkout with product id, quantity, and idempotency key",
);

assert.match(
  source,
  /const\s+checkoutPromise\s*=\s*postCheckout\(\{[\s\S]*productId:\s*checkoutProduct\.id,[\s\S]*quantity,[\s\S]*idempotencyKey,[\s\S]*\}\)/,
  "checkout submit should keep the POST checkout promise for toast.promise",
);

assert.match(
  source,
  /toast\.promise\(checkoutPromise,\s*\{[\s\S]*loading:\s*"Finalizando compra\.\.\."[\s\S]*success:\s*\(order\)\s*=>\s*order\.message[\s\S]*error:\s*\(error\)\s*=>[\s\S]*CHECKOUT_FALLBACK_ERROR_MESSAGE[\s\S]*\}\)/,
  "checkout submit should use toast.promise with dynamic API success and safe error messages",
);

assert.match(
  source,
  /setIsSubmittingCheckout\(true\)[\s\S]*finally\s*\{[\s\S]*setIsSubmittingCheckout\(false\)/,
  "checkout submit should disable the button while the POST is in progress",
);

assert.match(
  source,
  /setCheckoutOrder\(order\)/,
  "checkout submit should keep the API order response",
);

assert.doesNotMatch(
  source,
  /toast\.loading|toast\(order\.message|toast\.error\(errorMessage,\s*\{\s*id:/,
  "checkout submit should rely on toast.promise instead of manually replacing toast states",
);

assert.match(
  source,
  /onClick=\{handleCheckoutSubmit\}/,
  "primary checkout button should trigger the submit handler",
);

assert.match(
  source,
  /\{isSubmittingCheckout\s*\?\s*"Finalizando\.\.\."\s*:\s*"Finalizar compra"\}/,
  "primary checkout button should show a sending label while submitting",
);

assert.doesNotMatch(
  source,
  /role="status"|checkoutMessage|setCheckoutMessage|checkoutMessageTone|setCheckoutMessageTone/,
  "checkout page should not render the old inline message above the button",
);
