import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hookSource = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutFlow.ts"), "utf8");
const summarySource = readFileSync(resolve(__dirname, "../app/component/checkout/Summary.tsx"), "utf8");
const routeSource = readFileSync(resolve(__dirname, "../app/routes/checkout.tsx"), "utf8");

assert.match(routeSource, /useCheckoutFlow\(\{\s*product:\s*checkoutProduct\s*\}\)/, "checkout route should delegate state to the flow hook");
assert.match(hookSource, /const\s+totalPrice\s*=\s*calculateCheckoutTotal\(product,\s*quantity\)/, "summary total should be calculated from unit price and selected quantity");
assert.match(hookSource, /getCheckoutButtonDisabled\(\{[\s\S]*isQuantityValid:\s*quantityStatus\.isValid[\s\S]*isSubmittingCheckout[\s\S]*isOrderProcessing/, "checkout should derive the combined disabled rule");
assert.match(summarySource, /Preço unitário/, "summary should include the unit price line");
assert.match(summarySource, /Quantidade/, "summary should include the selected quantity line");
assert.match(summarySource, /formatCheckoutPrice\(totalPrice\)/, "summary total should render the calculated total");
assert.match(summarySource, /disabled=\{isCheckoutButtonDisabled\}/, "primary button should use the combined disabled rule");
assert.match(summarySource, /aria-disabled=\{isCheckoutButtonDisabled\}/, "primary button should communicate its disabled state");
assert.match(summarySource, /Finalizar compra/, "summary should include the primary checkout button text");
