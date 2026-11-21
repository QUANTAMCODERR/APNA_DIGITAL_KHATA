
interface SummaryCardProps {
  title: string;
  value: string;
  description: string;
}

export default function SummaryCard({
  title,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>

      <h2 className="mt-3 text-2xl font-bold text-slate-900">
        {value}
      </h2>

      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}
