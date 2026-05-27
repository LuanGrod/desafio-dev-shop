import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(__dirname, "..");
const outfile = resolve(tmpdir(), `checkout-api-client-${Date.now()}.mjs`);

await build({
  entryPoints: [resolve(frontendRoot, "app/utils/checkout/api.ts")],
  outfile,
  bundle: true,
  format: "esm",
  platform: "browser",
  define: {
    "import.meta.env.VITE_API_BASE_URL": '"http://api.test"',
  },
  plugins: [
    {
      name: "app-path-alias",
      setup(build) {
        build.onResolve({ filter: /^~\// }, (args) => {
          const resolvedPath = resolve(frontendRoot, "app", args.path.slice(2));
          const typedPath = `${resolvedPath}.ts`;

          return {
            path: existsSync(typedPath) ? typedPath : resolvedPath,
          };
        });
      },
    },
  ],
});

const { CheckoutApiError, getOrder, postCheckout } = await import(
  `${pathToFileURL(outfile).href}?cache=${Date.now()}`
);

globalThis.fetch = async (url, init) => {
  assert.equal(url, "http://api.test/checkout");
  assert.equal(init.method, "POST");
  assert.equal(init.headers["Content-Type"], "application/json");
  assert.equal(init.headers["Idempotency-Key"], "idem-1");
  assert.deepEqual(JSON.parse(init.body), {
    items: [{ product_id: 10, quantity: 2 }],
  });

  return new Response(
    JSON.stringify({
      order_id: 123,
      status: "PROCESSING",
      message: "Pedido em processamento.",
    }),
    { status: 201, headers: { "Content-Type": "application/json" } },
  );
};

assert.deepEqual(
  await postCheckout({
    productId: 10,
    quantity: 2,
    idempotencyKey: "idem-1",
  }),
  {
    order_id: 123,
    status: "PROCESSING",
    message: "Pedido em processamento.",
  },
  "checkout client should parse a successful order response",
);

globalThis.fetch = async () =>
  new Response(JSON.stringify({ message: "Estoque insuficiente." }), {
    status: 409,
    headers: { "Content-Type": "application/json" },
  });

await assert.rejects(
  () => getOrder(123),
  (error) =>
    error instanceof CheckoutApiError &&
    error.status === 409 &&
    error.message === "Estoque insuficiente.",
  "checkout client should preserve safe API error messages and status",
);
