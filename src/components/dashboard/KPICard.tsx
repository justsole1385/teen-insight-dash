interface Props {
  title: string;
  value: string;
  unit?: string;
  accent: "indigo" | "violet" | "amber" | "pink";
}

const accentMap: Record<Props["accent"], string> = {
  indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  pink: "border-pink-200 bg-pink-50 text-pink-700",
};

export function KPICard({ title, value, unit, accent }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span
        className={`inline-block w-fit rounded-full border px-2 py-1 text-xs font-medium ${accentMap[accent]}`}
      >
        {title}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-slate-900">{value}</span>
        {unit && <span className="text-sm text-slate-500">{unit}</span>}
      </div>
    </div>
  );
}
