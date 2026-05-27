import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckoutSummary } from "./Summary";
import type { CheckoutFlow } from "../../hook/checkout/useCheckoutFlow";

const product = {
  id: 1,
  name: "Capinha Case Cell",
  description: "Capinha resistente para celular",
  price: 1990,
  stock: 10,
};

function createCheckoutProps(overrides: Partial<CheckoutFlow> = {}): CheckoutFlow {
  const quantity = overrides.quantity ?? 1;

  return {
    product,
    quantity,
    totalPrice: product.price * quantity,
    checkoutOrder: null,
    checkoutMessageTone: "error",
    isSubmittingCheckout: false,
    isCheckoutButtonDisabled: false,
    canDecrementQuantity: quantity > 1,
    incrementQuantity: vi.fn(),
    decrementQuantity: vi.fn(),
    submitCheckout: vi.fn(),
    ...overrides,
  };
}

describe("CheckoutSummary", () => {
  it("desabilita o botão e troca o texto durante o envio", () => {
    render(
      <CheckoutSummary
        {...createCheckoutProps({
          isSubmittingCheckout: true,
          isCheckoutButtonDisabled: true,
        })}
      />,
    );

    const button = screen.getByRole("button", { name: "Finalizando..." });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("mostra mensagens de sucesso e erro na tela", () => {
    const { rerender } = render(
      <CheckoutSummary
        {...createCheckoutProps({
          checkoutOrder: {
            order_id: 12,
            status: "APPROVED",
            message: "Compra aprovada com sucesso.",
          },
          checkoutMessageTone: "success",
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Compra aprovada com sucesso.");

    rerender(
      <CheckoutSummary
        {...createCheckoutProps({
          checkoutOrder: {
            order_id: null,
            status: "ERROR",
            message: "Não foi possível concluir a compra agora.",
          },
          checkoutMessageTone: "error",
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Não foi possível concluir a compra agora.",
    );
  });

  it("incrementa e decrementa a quantidade exibida", async () => {
    const user = userEvent.setup();

    function StatefulCheckoutSummary() {
      const [quantity, setQuantity] = useState(2);

      return (
        <CheckoutSummary
          {...createCheckoutProps({
            quantity,
            totalPrice: product.price * quantity,
            canDecrementQuantity: quantity > 1,
            incrementQuantity: () => setQuantity((current) => current + 1),
            decrementQuantity: () => setQuantity((current) => Math.max(1, current - 1)),
          })}
        />
      );
    }

    render(<StatefulCheckoutSummary />);

    const stepper = within(screen.getByTestId("quantity-stepper"));

    expect(stepper.getByText("2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Aumentar valor" }));
    expect(stepper.getByText("3")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Diminuir valor" }));
    expect(stepper.getByText("2")).toBeInTheDocument();
  });

  it("bloqueia submit quando a quantidade é inválida", async () => {
    const user = userEvent.setup();
    const submitCheckout = vi.fn();

    render(
      <CheckoutSummary
        {...createCheckoutProps({
          quantity: 0,
          totalPrice: 0,
          isCheckoutButtonDisabled: true,
          canDecrementQuantity: false,
          submitCheckout,
        })}
      />,
    );

    const button = screen.getByRole("button", { name: "Finalizar compra" });

    expect(button).toBeDisabled();
    await user.click(button);
    expect(submitCheckout).not.toHaveBeenCalled();
  });

  it("mostra mensagem e texto de botão específicos enquanto o pedido está em processamento", () => {
    render(
      <CheckoutSummary
        {...createCheckoutProps({
          checkoutOrder: {
            order_id: 20,
            status: "PROCESSING",
            message: "Pedido recebido e em processamento.",
          },
          checkoutMessageTone: "processing",
          isCheckoutButtonDisabled: true,
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Pedido recebido e em processamento.",
    );
    expect(
      screen.getByRole("button", { name: "Processando pedido..." }),
    ).toBeDisabled();
  });
});
