import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(__dirname, "../app/hook/checkout/useCheckoutFlow.ts"), "utf8");

assert.match(source, /useQuery\(/, "checkout flow should use TanStack Query to control order status polling");
assert.match(source, /queryFn:\s*\(\)\s*=>\s*getOrder\(processingOrderId\s*\?\?\s*""\)/, "polling should call GET /orders/:order_id through the API client");
assert.match(source, /enabled:\s*Boolean\(processingOrderId\)\s*&&\s*isOrderProcessing/, "polling should only run when there is a processing order id");
assert.match(source, /refetchInterval:\s*\(query\)\s*=>[\s\S]*return\s+order\?\.status\s*===\s*"PROCESSING"\s*\?\s*(?:1000|2000)\s*:\s*false/, "polling should run while processing and stop otherwise");
assert.doesNotMatch(source, /setInterval|clearInterval/, "polling should be controlled by TanStack Query instead of a manual interval");
