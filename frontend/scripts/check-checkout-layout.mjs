import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const source = readFileSync(checkoutPath, "utf8");

assert.match(
  source,
  /data-testid="checkout-shell"/,
  "checkout page should expose a dedicated shell container",
);

assert.match(
  source,
  /data-testid="product-panel"/,
  "checkout page should have a product panel",
);

assert.match(
  source,
  /data-testid="summary-panel"/,
  "checkout page should have a summary/action panel",
);

assert.match(
  source,
  /lg:grid-cols-\[minmax\(0,1fr\)_minmax\(320px,0\.42fr\)\]/,
  "checkout shell should use a two-column desktop grid",
);

assert.match(
  source,
  /grid-cols-1/,
  "checkout shell should stack panels in a single column by default",
);

assert.match(
  source,
  /Finalizar compra/,
  "checkout page should make the primary purchase action visible",
);
