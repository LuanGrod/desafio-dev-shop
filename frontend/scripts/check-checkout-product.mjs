import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const productPath = resolve(__dirname, "../app/checkout/product.ts");
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");

const productSource = readFileSync(productPath, "utf8");
const checkoutSource = readFileSync(checkoutPath, "utf8");

assert.match(
  productSource,
  /export const checkoutProduct\s*=/,
  "checkout product should be exported from a dedicated module",
);

for (const field of ["id", "name", "description", "price", "stock"]) {
  assert.match(
    productSource,
    new RegExp(`${field}\\s*:`),
    `checkout product should include ${field}`,
  );
}

assert.match(
  productSource,
  /Capinha Clear Case iPhone 15/,
  "checkout product should represent the clear case product",
);

assert.match(
  productSource,
  /price\s*:\s*79\.9/,
  "checkout product should keep the expected price",
);

assert.match(
  productSource,
  /stock\s*:\s*5/,
  "checkout product should keep the expected stock",
);

assert.match(
  checkoutSource,
  /import\s+\{\s*checkoutProduct\s*\}/,
  "checkout page should import the product module",
);

assert.match(
  checkoutSource,
  /checkoutProduct\.name/,
  "checkout page should render the product name from the product module",
);

assert.match(
  checkoutSource,
  /checkoutProduct\.description/,
  "checkout page should render the product description from the product module",
);

assert.match(
  checkoutSource,
  /checkoutProduct\.price/,
  "checkout page should render the product price from the product module",
);

assert.match(
  checkoutSource,
  /checkoutProduct\.stock/,
  "checkout page should render the product stock from the product module",
);
