import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const productSource = readFileSync(resolve(__dirname, "../app/data/product.ts"), "utf8");
const routeSource = readFileSync(resolve(__dirname, "../app/routes/checkout.tsx"), "utf8");
const productPanelSource = readFileSync(resolve(__dirname, "../app/component/product/Card.tsx"), "utf8");

assert.match(productSource, /export const checkoutProduct\s*=/, "checkout product should be exported from a dedicated module");
for (const field of ["id", "name", "description", "price", "stock"]) {
  assert.match(productSource, new RegExp(field + "\\s*:"), "checkout product should include " + field);
}
assert.match(productSource, /Capinha Clear Case iPhone 15/, "checkout product should represent the clear case product");
assert.match(productSource, /price\s*:\s*79\.9/, "checkout product should keep the expected price");
assert.match(productSource, /stock\s*:\s*5/, "checkout product should keep the expected stock");
assert.match(routeSource, /import\s+\{\s*checkoutProduct\s*\}/, "checkout page should import the product module");
assert.match(routeSource, /useCheckoutFlow\(\{\s*product:\s*checkoutProduct\s*\}\)/, "checkout page should pass the product into the flow hook");
assert.match(productPanelSource, /\{product\.name\}/, "product panel should render the product name from props");
assert.match(productPanelSource, /\{product\.description\}/, "product panel should render the product description from props");
assert.match(productPanelSource, /formatCheckoutPrice\(product\.price\)/, "product panel should render the product price from props");
assert.match(productPanelSource, /\$\{product\.stock\} unidades/, "product panel should render the product stock from props");
