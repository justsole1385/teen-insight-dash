interface Props {
  title: string;
  value: string;
  unit?: string;
  accent: "blue" | "orange" | "pink" | "purple";
}

const accentMap: Record<Props["accent"], string> = {
  blue: "bg-blue-100 text-blue-700",
  orange: "bg-orange-100 text-orange-700",
  pink: "bg-pink-100 text-pink-700",
  purple: "bg-purple-100 text-purple-700",
};

export function KPICard({ title, value, unit, accent }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-2 border border-gray-100">
      <span className={`inline-block w-fit text-xs font-medium px-2 py-1 rounded-full ${accentMap[accent]}`}>
        {title}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}