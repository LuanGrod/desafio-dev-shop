import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const source = readFileSync(checkoutPath, "utf8");

assert.match(
  source,
  /type\s+CheckoutMessageTone\s*=\s*"processing"\s*\|\s*"success"\s*\|\s*"rejected"\s*\|\s*"error"/,
  "checkout page should model distinct visual tones for processing, success, rejection, and unexpected errors",
);

assert.match(
  source,
  /type\s+CheckoutDisplayOrder\s*=[\s\S]*CheckoutOrderResponse[\s\S]*status:\s*"ERROR"[\s\S]*message:\s*string[\s\S]*\}/,
  "checkout page should use checkoutOrder as the single source for API and local error messages",
);

assert.doesNotMatch(
  source,
  /checkoutErrorMessage|setCheckoutErrorMessage|const\s+checkoutMessage\s*=/,
  "checkout page should not keep separate message state or derived checkoutMessage aliases",
);

assert.doesNotMatch(
  source,
  /checkoutMessage\.title|title:\s*"Pedido em processamento"|title:\s*"Status aprovado"|title:\s*"Status rejeitado"|title:\s*"Não foi possível concluir"/,
  "checkout status message should not render or define separate titles",
);

assert.match(
  source,
  /const\s+checkoutMessageTone(?::\s*CheckoutMessageTone)?\s*=[\s\S]*checkoutOrder\?\.status\s*===\s*"PROCESSING"[\s\S]*"processing"[\s\S]*checkoutOrder\?\.status\s*===\s*"APPROVED"[\s\S]*"success"[\s\S]*checkoutOrder\?\.status\s*===\s*"REJECTED"[\s\S]*"rejected"[\s\S]*"error"/s,
  "checkout page should derive a distinct visual tone from checkoutOrder status",
);

assert.match(
  source,
  /setCheckoutOrder\(\{\s*order_id:\s*null,\s*status:\s*"ERROR",\s*message:\s*CHECKOUT_FALLBACK_ERROR_MESSAGE,?\s*\}\)/,
  "polling or unexpected failures should show the local generic fallback through checkoutOrder",
);

assert.match(
  source,
  /role="status"[\s\S]*aria-live="polite"[\s\S]*\{checkoutOrder\.message\}/,
  "checkout page should expose checkoutOrder.message in a screen-reader-friendly inline region",
);

assert.match(
  source,
  /const\s+checkoutMessageToneClasses[\s\S]*processing:[\s\S]*success:[\s\S]*rejected:[\s\S]*error:[\s\S]*checkoutMessageToneClasses\[checkoutMessageTone\]/,
  "checkout message styles should differentiate processing, success, rejection, and unexpected errors",
);

assert.doesNotMatch(
  source,
  /Compra aprovada|Pagamento aprovado|Pedido aprovado|Compra rejeitada|Pedido rejeitado|Estoque insuficiente\./,
  "checkout page should not hardcode final approval, rejection, or stock messages as business rules",
);
