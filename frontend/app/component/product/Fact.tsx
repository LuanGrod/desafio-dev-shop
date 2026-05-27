type ProductFactProps = {
  label: string;
  value: string;
};

export function ProductFact({ label, value }: ProductFactProps) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <p className="font-medium text-zinc-950">{value}</p>
      <p>{label}</p>
    </div>
  );
}
