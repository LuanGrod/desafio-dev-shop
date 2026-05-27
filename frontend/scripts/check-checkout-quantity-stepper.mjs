import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const hookSource = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutFlow.ts"), "utf8");
const stepperSource = readFileSync(resolve(__dirname, "../app/component/stepper/Basic.tsx"), "utf8");

assert.match(hookSource, /useState\s*\(\s*1\s*\)/, "quantity should start at 1");
assert.match(stepperSource, /data-testid="quantity-stepper"/, "checkout page should expose a quantity stepper");
assert.match(stepperSource, /aria-label="Diminuir valor"/, "decrement button should have a clear accessible name");
assert.match(stepperSource, /aria-label="Aumentar valor"/, "increment button should have a clear accessible name");
assert.match(hookSource, /setQuantity\s*\(\s*\(\s*current\s*\)\s*=>\s*Math\.max\s*\(\s*1\s*,\s*current\s*-\s*1\s*\)\s*\)/, "decrement should not allow the quantity to go below 1");
assert.match(hookSource, /setQuantity\s*\(\s*\(\s*current\s*\)\s*=>\s*current\s*\+\s*1\s*\)/, "increment should increase quantity by 1");
assert.match(stepperSource, /disabled=\{!canDecrementQuantity\}/, "decrement button should be disabled when decrement is not allowed");
assert.doesNotMatch(stepperSource, /<input\b[^>]*type="text"/, "quantity stepper should not use a loose text input as the main control");
