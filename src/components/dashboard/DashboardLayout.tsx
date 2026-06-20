import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function DashboardLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">{title}</h1>
        {children}
      </div>
    </div>
  );
}