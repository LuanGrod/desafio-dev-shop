import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hookSource = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutFlow.ts"), "utf8");
const summarySource = readFileSync(resolve(__dirname, "../app/component/checkout/Summary.tsx"), "utf8");
const routeSource = readFileSync(resolve(__dirname, "../app/routes/checkout.tsx"), "utf8");

assert.match(routeSource, /return\s+<CheckoutPageView\s+\{\.\.\.checkout\}\s*\/>/, "checkout route should only render the dumb checkout view");
assert.ok(hookSource.includes(`from "../../utils/checkout/api"`), "checkout flow should import the POST checkout client");
assert.match(hookSource, /const\s+\[isSubmittingCheckout,\s*setIsSubmittingCheckout\]\s*=\s*useState\(false\)/, "checkout flow should track when POST checkout is being sent");
assert.match(hookSource, /const\s+\[checkoutOrder,\s*setCheckoutOrder\]/, "checkout flow should store the order returned by the checkout API");
assert.match(hookSource, /const\s+submitCheckout\s*=\s*useCallback\(\(\)\s*=>/, "checkout flow should define the submit handler outside the view");
assert.doesNotMatch(hookSource + summarySource, /import\s+toast\s+from\s+"react-hot-toast"|toast\./, "checkout should not use toast notifications for checkout feedback");
assert.match(hookSource, /if\s*\(!quantityStatus\.isValid\)\s*\{[\s\S]*setCheckoutOrder\(createInvalidQuantityOrder\(\)\)[\s\S]*return;/, "checkout submit should block invalid local quantity and show the persistent inline message");
assert.match(hookSource, /if\s*\([\s\S]*isCheckoutSubmitLockedRef\.current[\s\S]*isSubmittingCheckout[\s\S]*isOrderProcessing[\s\S]*\)\s*\{\s*return;\s*\}/, "checkout submit should prevent repeated attempts while sending or processing");
assert.match(hookSource, /const\s+idempotencyKey\s*=\s*checkoutIdempotency\.getOrCreateKey\(\)/, "checkout submit should create or reuse the current idempotency key");
assert.match(hookSource, /checkoutMutation\.mutate\(\{[\s\S]*productId:\s*product\.id,[\s\S]*quantity,[\s\S]*idempotencyKey,[\s\S]*\}\)/, "checkout submit should call POST /checkout with product id, quantity, and idempotency key");
assert.match(hookSource, /useMutation\(\{[\s\S]*mutationFn:\s*postCheckout[\s\S]*onSuccess:\s*\(order\)\s*=>[\s\S]*setCheckoutOrder\(order\)/, "checkout mutation should use POST /checkout and render the API message persistently");
assert.match(hookSource, /setIsSubmittingCheckout\(true\)/, "checkout submit should mark the POST as in progress");
assert.match(hookSource, /onSettled:[\s\S]*setIsSubmittingCheckout\(false\)/, "checkout submit should clear the sending state when the mutation settles");
assert.match(summarySource, /onClick=\{submitCheckout\}/, "primary checkout button should trigger the submit handler prop");
assert.match(summarySource, /checkoutButtonLabel/, "primary checkout button should derive its label from checkout state");
assert.match(summarySource, /Finalizando\.\.\./, "primary checkout button should show a sending label while submitting");
assert.match(summarySource, /Processando pedido\.\.\./, "primary checkout button should show a processing label while polling");
assert.match(summarySource, /Finalizar compra/, "primary checkout button should show the default purchase label");
assert.doesNotMatch(hookSource, /setCheckoutMessage|setCheckoutMessageTone|checkoutErrorMessage|setCheckoutErrorMessage|const\s+checkoutMessage\s*=/, "checkout flow should not use separate message state outside checkoutOrder");
