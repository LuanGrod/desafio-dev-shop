import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPath = resolve(__dirname, "../app/root.tsx");
const checkoutPath = resolve(__dirname, "../app/routes/checkout.tsx");
const queryClientPath = resolve(__dirname, "../app/checkout/query-client.tsx");

assert.ok(
  existsSync(queryClientPath),
  "checkout should define a shared QueryClient provider module",
);

const rootSource = readFileSync(rootPath, "utf8");
const checkoutSource = readFileSync(checkoutPath, "utf8");
const queryClientSource = readFileSync(queryClientPath, "utf8");

assert.match(
  queryClientSource,
  /export const queryClient\s*=\s*new QueryClient\(/,
  "query client should be created once at module scope",
);

assert.match(
  queryClientSource,
  /<QueryClientProvider client=\{queryClient\}>/,
  "query client module should provide the shared client",
);

assert.match(
  rootSource,
  /<CheckoutQueryProvider>\s*<Outlet\s*\/>\s*<\/CheckoutQueryProvider>/,
  "React route tree should be wrapped with QueryClientProvider",
);

assert.match(
  checkoutSource,
  /useMutation\(/,
  "checkout submit should use a TanStack Query mutation",
);

assert.match(
  checkoutSource,
  /mutationFn:\s*postCheckout/,
  "checkout mutation should call the POST /checkout API client",
);

assert.match(
  checkoutSource,
  /useQuery\(/,
  "checkout status polling should use a TanStack Query query",
);

assert.match(
  checkoutSource,
  /queryFn:\s*\(\)\s*=>\s*getOrder\(/,
  "checkout status query should call the GET /orders/:order_id API client",
);

assert.match(
  checkoutSource,
  /enabled:\s*Boolean\(processingOrderId\)\s*&&\s*isOrderProcessing/,
  "checkout status query should not run without a processing order id",
);

assert.match(
  checkoutSource,
  /refetchInterval:\s*\(query\)\s*=>[\s\S]*PROCESSING[\s\S]*2000[\s\S]*false/,
  "checkout status query should poll only while the order is processing",
);

assert.doesNotMatch(
  checkoutSource,
  /setInterval|clearInterval/,
  "checkout polling should not keep a manual interval after React Query integration",
);
