import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pageSource = readFileSync(resolve(__dirname, "../app/component/checkout/PageView.tsx"), "utf8");
const productSource = readFileSync(resolve(__dirname, "../app/component/product/Card.tsx"), "utf8");
const summarySource = readFileSync(resolve(__dirname, "../app/component/checkout/Summary.tsx"), "utf8");

assert.match(pageSource, /data-testid="checkout-shell"/, "checkout page should expose a dedicated shell container");
assert.match(productSource, /data-testid="product-panel"/, "checkout page should have a product panel");
assert.match(summarySource, /data-testid="summary-panel"/, "checkout page should have a summary/action panel");
assert.match(pageSource, /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(320px,0\.42fr\)\]/, "checkout shell should use a two-column desktop grid");
assert.match(pageSource, /grid-cols-1/, "checkout shell should stack panels in a single column by default");
assert.match(summarySource, /Finalizar compra/, "checkout page should make the primary purchase action visible");
