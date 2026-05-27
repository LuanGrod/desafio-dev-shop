type SummaryRowProps = {
  label: string;
  value: string;
};

export function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt>{label}</dt>
      <dd className="font-medium text-zinc-950">{value}</dd>
    </div>
  );
}
