import { expect, test } from "@playwright/test";

const apiHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Idempotency-Key",
};

test("finaliza o checkout e atualiza o status do pedido", async ({ page }) => {
  let checkoutPayload: unknown = null;
  let idempotencyKey: string | null = null;
  let orderStatusRequests = 0;

  await page.route("http://localhost:3000/checkout", async (route, request) => {
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: apiHeaders });
      return;
    }

    expect(request.method()).toBe("POST");
    idempotencyKey = request.headers()["idempotency-key"] ?? null;
    checkoutPayload = request.postDataJSON();

    await route.fulfill({
      status: 202,
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: 123,
        status: "PROCESSING",
        message: "Pedido recebido e está sendo processado.",
      }),
    });
  });

  await page.route("http://localhost:3000/orders/123", async (route, request) => {
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: apiHeaders });
      return;
    }

    expect(request.method()).toBe("GET");
    orderStatusRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 300));

    await route.fulfill({
      status: 200,
      headers: { ...apiHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: 123,
        status: "APPROVED",
        message: "Compra aprovada com sucesso.",
      }),
    });
  });

  await page.goto("/checkout");

  const summaryPanel = page.getByTestId("summary-panel");

  await expect(summaryPanel.getByRole("heading", { name: "Sua compra" })).toBeVisible();
  await page.getByRole("button", { name: /aumentar valor/i }).click();
  await expect(page.getByTestId("quantity-stepper").getByText("2")).toBeVisible();

  await page.getByRole("button", { name: /finalizar compra/i }).click();

  await expect(page.getByRole("status")).toContainText("Pedido recebido e está sendo processado.");
  await expect(page.getByRole("status")).toContainText("Compra aprovada com sucesso.");

  expect(idempotencyKey).toBeTruthy();
  expect(checkoutPayload).toEqual({
    items: [{ product_id: 1, quantity: 2 }],
  });
  expect(orderStatusRequests).toBeGreaterThanOrEqual(1);
});
