import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  badge?: string;
}

export function ChartCard({ title, children, badge }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex min-h-6 flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {badge && (
          <span className="inline-flex w-fit items-center rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium leading-4 text-violet-700">
            {badge}
          </span>
        )}
      </div>
      <div className="w-full h-72">{children}</div>
    </section>
  );
}
