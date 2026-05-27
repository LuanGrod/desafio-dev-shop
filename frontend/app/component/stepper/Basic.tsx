type StepperBasicProps = {
  label?: string;
  quantity: number;
  canIncrementQuantity: boolean;
  canDecrementQuantity: boolean;
  incrementQuantity: () => void;
  decrementQuantity: () => void;
};

export function StepperBasic({
  label = "Quantidade",
  quantity,
  canIncrementQuantity,
  canDecrementQuantity,
  incrementQuantity,
  decrementQuantity,
}: StepperBasicProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-200 p-3">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      <div
        data-testid="quantity-stepper"
        className="flex items-center gap-3"
        aria-label="Valor selecionado"
      >
        <button
          type="button"
          aria-label="Diminuir valor"
          disabled={!canDecrementQuantity}
          onClick={decrementQuantity}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 text-lg font-medium text-zinc-950 transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:border-zinc-200 disabled:hover:bg-white"
        >
          -
        </button>
        <span className="min-w-6 text-center text-base font-semibold text-zinc-950">
          {quantity}
        </span>
        <button
          type="button"
          aria-label="Aumentar valor"
          disabled={!canIncrementQuantity}
          onClick={incrementQuantity}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-300 text-lg font-medium text-zinc-950 transition hover:border-zinc-400 hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:border-zinc-300 disabled:hover:bg-white"
        >
          +
        </button>
      </div>
    </div>
  );
}
