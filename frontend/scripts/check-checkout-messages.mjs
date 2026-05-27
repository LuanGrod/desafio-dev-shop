import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const viewModelSource = readFileSync(resolve(__dirname, "../app/utils/checkout/view-model.ts"), "utf8");
const statusSource = readFileSync(resolve(__dirname, "../app/component/checkout/StatusMessage.tsx"), "utf8");
const hookSource = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutFlow.ts"), "utf8");

assert.match(viewModelSource, /type\s+CheckoutMessageTone\s*=\s*"processing"\s*\|\s*"success"\s*\|\s*"rejected"\s*\|\s*"error"/, "checkout should model distinct visual tones");
assert.match(viewModelSource, /type\s+CheckoutDisplayOrder\s*=[\s\S]*CheckoutOrderResponse[\s\S]*status:\s*"ERROR"[\s\S]*message:\s*string[\s\S]*\}/, "checkout should use checkoutOrder as the single source for API and local error messages");
assert.doesNotMatch(hookSource, /checkoutErrorMessage|setCheckoutErrorMessage|const\s+checkoutMessage\s*=/, "checkout flow should not keep separate message state or derived aliases");
assert.match(viewModelSource, /getCheckoutMessageTone[\s\S]*status === "PROCESSING"[\s\S]*"processing"[\s\S]*status === "APPROVED"[\s\S]*"success"[\s\S]*status === "REJECTED"[\s\S]*"rejected"[\s\S]*"error"/, "checkout should derive a distinct visual tone from checkoutOrder status");
assert.match(hookSource, /setCheckoutOrder\(toCheckoutErrorOrder\(new Error\(CHECKOUT_FALLBACK_ERROR_MESSAGE\)\)\)/, "polling failures should show the local generic fallback through checkoutOrder");
assert.match(statusSource, /role="status"[\s\S]*aria-live="polite"[\s\S]*\{order\.message\}/, "checkout should expose checkoutOrder.message in a screen-reader-friendly inline region");
assert.match(statusSource, /checkoutMessageToneClasses[\s\S]*processing:[\s\S]*success:[\s\S]*rejected:[\s\S]*error:[\s\S]*checkoutMessageToneClasses\[tone\]/, "checkout message styles should differentiate statuses");
assert.doesNotMatch(viewModelSource + hookSource, /Compra aprovada|Pagamento aprovado|Pedido aprovado|Compra rejeitada|Pedido rejeitado|Estoque insuficiente\./, "checkout frontend should not hardcode final business messages");
