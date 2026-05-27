export function CheckoutHeader() {
  return (
    <header className="flex flex-col gap-3 border-b border-zinc-200 pb-6">
      <p className="text-sm font-medium uppercase text-zinc-500">Checkout</p>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-normal text-zinc-950 sm:text-4xl">
            Finalize sua compra
          </h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">
            Revise o produto, escolha a quantidade e acompanhe o status do pedido
            em uma tela simples e segura.
          </p>
        </div>
        <p className="text-sm font-medium text-zinc-500">Compra protegida</p>
      </div>
    </header>
  );
}
