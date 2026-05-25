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

assert.doesNotMatch(
  source,
  /import\s+toast\s+from\s+"react-hot-toast"|toast\./,
  "checkout page should not use toast notifications for checkout feedback",
);

assert.match(
  source,
  /if\s*\(quantity\s*<\s*1\)\s*\{[\s\S]*setCheckoutOrder\(\{\s*order_id:\s*null,\s*status:\s*"ERROR",\s*message:\s*"Informe uma quantidade válida\."[\s\S]*return;/,
  "checkout submit should block invalid local quantity and show the persistent inline message through checkoutOrder",
);

assert.match(
  source,
  /if\s*\([\s\S]*isSubmittingCheckout[\s\S]*isOrderProcessing[\s\S]*\)\s*\{\s*return;\s*\}/,
  "checkout submit should prevent repeated attempts while sending or processing",
);

assert.match(
  source,
  /const\s+idempotencyKey\s*=\s*checkoutIdempotency\.getOrCreateKey\(\)/,
  "checkout submit should create or reuse the current idempotency key",
);

assert.match(
  source,
  /checkoutMutation\.mutate\(\{[\s\S]*productId:\s*checkoutProduct\.id,[\s\S]*quantity,[\s\S]*idempotencyKey,[\s\S]*\}\)/,
  "checkout submit should call POST /checkout with product id, quantity, and idempotency key",
);

assert.doesNotMatch(
  source,
  /toast\.promise/,
  "checkout submit should not duplicate persistent status messages through toast.promise",
);

assert.match(
  source,
  /useMutation\(\{[\s\S]*mutationFn:\s*postCheckout[\s\S]*onSuccess:\s*\(order\)\s*=>[\s\S]*setCheckoutOrder\(order\)/,
  "checkout mutation should use POST /checkout and render the API message persistently",
);

assert.match(
  source,
  /setIsSubmittingCheckout\(true\)/,
  "checkout submit should mark the POST as in progress",
);

assert.match(
  source,
  /onSettled:[\s\S]*setIsSubmittingCheckout\(false\)/,
  "checkout submit should clear the sending state when the mutation settles",
);

assert.match(
  source,
  /setCheckoutOrder\(order\)/,
  "checkout submit should keep the API order response",
);

assert.doesNotMatch(
  source,
  /toast\.loading|toast\(order\.message|toast\.error\(errorMessage,\s*\{\s*id:/,
  "checkout submit should not manually manage toast notification states",
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
  /setCheckoutMessage|setCheckoutMessageTone|checkoutErrorMessage|setCheckoutErrorMessage|const\s+checkoutMessage\s*=/,
  "checkout submit should not use separate message state outside checkoutOrder",
);
