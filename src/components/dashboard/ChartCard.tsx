import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="w-full h-72">{children}</div>
    </div>
  );
}