import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const source = readFileSync(checkoutPath, "utf8");

assert.match(
  source,
  /useEffect/,
  "checkout page should use an effect to control order status polling",
);

assert.match(
  source,
  /getOrder\(checkoutOrder\.order_id\)/,
  "polling should call GET /orders/:order_id through the API client",
);

assert.match(
  source,
  /setInterval\([\s\S]*,\s*(?:1000|2000)\)/,
  "polling should run around every 1 or 2 seconds while processing",
);

assert.match(
  source,
  /clearInterval\(pollingInterval\)/,
  "polling should stop and clean up its interval",
);
