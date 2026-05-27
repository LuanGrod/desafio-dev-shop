import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourcePath = resolve(__dirname, "../app/utils/checkout/view-model.ts");
const apiSourcePath = resolve(__dirname, "../app/utils/checkout/api.ts");

assert.ok(
  existsSync(sourcePath),
  "checkout view-model helpers should live outside the route component",
);

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: true,
    },
  }).outputText;
}

const outputDir = resolve(tmpdir(), "totvs-checkout-view-model-test");
mkdirSync(outputDir, { recursive: true });
const apiUtilsOutputPath = resolve(outputDir, "api-utils.mjs");
const apiOutputPath = resolve(outputDir, "api.mjs");
const outputPath = resolve(outputDir, basename(sourcePath).replace(/.ts$/, ".mjs"));
const apiUtilsSource = readFileSync(resolve(__dirname, "../app/utils/api.ts"), "utf8").replace(
  /import.meta.env.VITE_API_BASE_URL/g,
  "undefined",
);
const apiSource = readFileSync(apiSourcePath, "utf8")
  .replace("~/utils/api", "./api-utils.mjs")
  .replace(
    /import.meta.env.VITE_API_BASE_URL/g,
    "undefined",
  );
const source = readFileSync(sourcePath, "utf8")
  .replace('import { GenericApiError } from "../api";', 'import { CheckoutApiError } from "./api.mjs";')
  .replace('"./api"', '"./api.mjs"')
  .replace(/GenericApiError/g, "CheckoutApiError");

writeFileSync(apiUtilsOutputPath, transpile(apiUtilsSource));
writeFileSync(apiOutputPath, transpile(apiSource));
writeFileSync(outputPath, transpile(source));

const { CHECKOUT_FALLBACK_ERROR_MESSAGE, CheckoutApiError } = await import(
  pathToFileURL(apiOutputPath).href,
);

const {
  buildCheckoutItemsSignature,
  calculateCheckoutTotal,
  getCheckoutButtonDisabled,
  getCheckoutMessageTone,
  getCheckoutQuantityStatus,
  toCheckoutErrorOrder,
} = await import(pathToFileURL(outputPath).href);

assert.equal(buildCheckoutItemsSignature(12, 3), "12:3");
assert.equal(calculateCheckoutTotal({ price: 149.9 }, 2), 299.8);

assert.deepEqual(getCheckoutQuantityStatus(1), {
  isValid: true,
  canDecrement: false,
});
assert.deepEqual(getCheckoutQuantityStatus(0), {
  isValid: false,
  canDecrement: false,
});

assert.equal(
  getCheckoutButtonDisabled({
    isQuantityValid: false,
    isSubmittingCheckout: false,
    isOrderProcessing: false,
  }),
  true,
);
assert.equal(
  getCheckoutButtonDisabled({
    isQuantityValid: true,
    isSubmittingCheckout: true,
    isOrderProcessing: false,
  }),
  true,
);
assert.equal(
  getCheckoutButtonDisabled({
    isQuantityValid: true,
    isSubmittingCheckout: false,
    isOrderProcessing: true,
  }),
  true,
);
assert.equal(
  getCheckoutButtonDisabled({
    isQuantityValid: true,
    isSubmittingCheckout: false,
    isOrderProcessing: false,
  }),
  false,
);

assert.equal(
  getCheckoutMessageTone({ order_id: 1, status: "PROCESSING", message: "Processando" }),
  "processing",
);
assert.equal(
  getCheckoutMessageTone({ order_id: 1, status: "APPROVED", message: "Aprovado" }),
  "success",
);
assert.equal(
  getCheckoutMessageTone({ order_id: 1, status: "REJECTED", message: "Rejeitado" }),
  "rejected",
);
assert.equal(
  getCheckoutMessageTone({ order_id: null, status: "ERROR", message: "Falha" }),
  "error",
);

assert.deepEqual(toCheckoutErrorOrder(new CheckoutApiError("Falha validada", 400)), {
  order_id: null,
  status: "ERROR",
  message: "Falha validada",
});
assert.deepEqual(toCheckoutErrorOrder(new Error("raw failure")), {
  order_id: null,
  status: "ERROR",
  message: CHECKOUT_FALLBACK_ERROR_MESSAGE,
});
