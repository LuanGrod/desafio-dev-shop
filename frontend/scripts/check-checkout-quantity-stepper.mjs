import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const source = readFileSync(checkoutPath, "utf8");

assert.match(
  source,
  /useState\s*\(\s*1\s*\)/,
  "quantity should start at 1",
);

assert.match(
  source,
  /data-testid="quantity-stepper"/,
  "checkout page should expose a quantity stepper",
);

assert.match(
  source,
  /aria-label="Diminuir quantidade"/,
  "decrement button should have a clear accessible name",
);

assert.match(
  source,
  /aria-label="Aumentar quantidade"/,
  "increment button should have a clear accessible name",
);

assert.match(
  source,
  /setQuantity\s*\(\s*\(\s*current\s*\)\s*=>\s*Math\.max\s*\(\s*1\s*,\s*current\s*-\s*1\s*\)\s*\)/,
  "decrement should not allow the quantity to go below 1",
);

assert.match(
  source,
  /setQuantity\s*\(\s*\(\s*current\s*\)\s*=>\s*current\s*\+\s*1\s*\)/,
  "increment should increase quantity by 1",
);

assert.match(
  source,
  /disabled=\{quantity === 1\}/,
  "decrement button should be disabled at quantity 1",
);

assert.doesNotMatch(
  source,
  /<input\b[^>]*type="text"/,
  "quantity stepper should not use a loose text input as the main control",
);
