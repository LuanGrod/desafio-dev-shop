import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const source = readFileSync(checkoutPath, "utf8");

assert.match(
  source,
  /const\s+totalPrice\s*=\s*checkoutProduct\.price\s*\*\s*quantity/,
  "summary total should be calculated from unit price and selected quantity",
);

assert.match(
  source,
  /const\s+isQuantityValid\s*=\s*quantity\s*>=\s*1/,
  "checkout should track whether the local quantity is valid",
);

assert.match(
  source,
  /const\s+isCheckoutButtonDisabled\s*=\s*!isQuantityValid\s*\|\|\s*isSubmittingCheckout\s*\|\|\s*isOrderProcessing/,
  "primary button should be disabled for invalid quantity, submit, and processing states",
);

assert.match(
  source,
  /Preço unitário/,
  "summary should include the unit price line",
);

assert.match(
  source,
  /Quantidade/,
  "summary should include the selected quantity line",
);

assert.match(
  source,
  /priceFormatter\.format\(totalPrice\)/,
  "summary total should render the calculated total",
);

assert.match(
  source,
  /disabled=\{isCheckoutButtonDisabled\}/,
  "primary button should use the combined disabled rule",
);

assert.match(
  source,
  /aria-disabled=\{isCheckoutButtonDisabled\}/,
  "primary button should communicate its disabled state",
);

assert.match(
  source,
  /Finalizar compra/,
  "summary should include the primary checkout button text",
);
