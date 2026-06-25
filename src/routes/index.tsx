import { createFileRoute } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { FilterBar, type FilterValues } from "../components/dashboard/FilterBar";
import { KPICard } from "../components/dashboard/KPICard";
import { ChartCard } from "../components/dashboard/ChartCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Impacto de redes sociales en el bienestar adolescente" },
      {
        name: "description",
        content: "Dashboard exploratorio del uso de redes sociales y el bienestar adolescente.",
      },
      {
        property: "og:title",
        content: "Impacto de redes sociales en el bienestar adolescente",
      },
      {
        property: "og:description",
        content: "Dashboard exploratorio del uso de redes sociales y el bienestar adolescente.",
      },
    ],
  }),
  component: Index,
});

interface Row {
  age: number;
  gender: string;
  platform_usage: string;
  social_interaction_level: string;
  daily_social_media_hours: number;
  sleep_hours: number;
  screen_time_before_sleep: number;
  academic_performance: number;
  stress_level: number;
  anxiety_level: number;
  addiction_level: number;
  depression_label: number;
}

const COLORS = {
  indigo: "#6366F1",
  violet: "#8B5CF6",
  lightPurple: "#A78BFA",
  pink: "#EC4899",
  amber: "#F59E0B",
  teal: "#14B8A6",
  grid: "#E2E8F0",
  secondaryText: "#64748B",
};

const PLATFORM_COLORS = [
  COLORS.indigo,
  COLORS.violet,
  COLORS.lightPurple,
  COLORS.pink,
  COLORS.amber,
  COLORS.teal,
];

function avg(rows: Row[], key: keyof Row): number {
  if (!rows.length) return 0;
  const nums = rows.map((r) => Number(r[key])).filter((n) => !isNaN(n));
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function uniqueSorted<T>(arr: T[]): T[] {
  return Array.from(new Set(arr)).sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { numeric: true }),
  );
}

function Index() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    age: "",
    gender: "",
    platform: "",
    interaction: "",
  });

  useEffect(() => {
    fetch("/data/teen_subset.csv")
      .then((r) => {
        if (!r.ok) throw new Error("CSV no encontrado");
        return r.text();
      })
      .then((text) => {
        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });
        const data: Row[] = parsed.data
          .filter((d) => d.gender)
          .map((d) => ({
            age: Number(d.age),
            gender: d.gender,
            platform_usage: d.platform_usage,
            social_interaction_level: d.social_interaction_level,
            daily_social_media_hours: Number(d.daily_social_media_hours),
            sleep_hours: Number(d.sleep_hours),
            screen_time_before_sleep: Number(d.screen_time_before_sleep),
            academic_performance: Number(d.academic_performance),
            stress_level: Number(d.stress_level),
            anxiety_level: Number(d.anxiety_level),
            addiction_level: Number(d.addiction_level),
            depression_label: Number(d.depression_label),
          }));
        setRows(data);
      })
      .catch((e) => setError(e.message));
  }, []);

  const options = useMemo(
    () => ({
      ages: rows ? uniqueSorted(rows.map((r) => String(r.age))) : [],
      genders: rows ? uniqueSorted(rows.map((r) => r.gender)) : [],
      platforms: rows ? uniqueSorted(rows.map((r) => r.platform_usage)) : [],
      interactions: rows ? uniqueSorted(rows.map((r) => r.social_interaction_level)) : [],
    }),
    [rows],
  );

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter(
      (r) =>
        (!filters.age || String(r.age) === filters.age) &&
        (!filters.gender || r.gender === filters.gender) &&
        (!filters.platform || r.platform_usage === filters.platform) &&
        (!filters.interaction || r.social_interaction_level === filters.interaction),
    );
  }, [rows, filters]);

  // General views intentionally use the complete dataset and never the filtered subset.
  const platformAvg = useMemo(() => {
    const map = new Map<string, number[]>();
    (rows ?? []).forEach((r) => {
      const values = map.get(r.platform_usage) ?? [];
      values.push(r.daily_social_media_hours);
      map.set(r.platform_usage, values);
    });
    return Array.from(map.entries()).map(([platform, values]) => ({
      platform,
      horas: +(values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
    }));
  }, [rows]);

  const genderStress = useMemo(() => {
    const map = new Map<string, { stress: number[]; anxiety: number[] }>();
    (rows ?? []).forEach((r) => {
      const current = map.get(r.gender) ?? { stress: [], anxiety: [] };
      current.stress.push(r.stress_level);
      current.anxiety.push(r.anxiety_level);
      map.set(r.gender, current);
    });
    return Array.from(map.entries()).map(([gender, { stress, anxiety }]) => ({
      gender,
      estres: +(stress.reduce((total, value) => total + value, 0) / stress.length).toFixed(2),
      ansiedad: +(anxiety.reduce((total, value) => total + value, 0) / anxiety.length).toFixed(2),
    }));
  }, [rows]);

  const scatterSleep = useMemo(
    () =>
      filtered.map((r) => ({
        x: r.daily_social_media_hours,
        y: r.sleep_hours,
      })),
    [filtered],
  );
  const scatterAcad = useMemo(
    () =>
      filtered.map((r) => ({
        x: r.daily_social_media_hours,
        y: r.academic_performance,
      })),
    [filtered],
  );

  if (error) {
    return (
      <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
        <div className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm">
          No se pudo cargar el archivo <code>/data/teen_subset.csv</code>. {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!rows) {
    return (
      <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
        <div className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm">
          Cargando datos…
        </div>
      </DashboardLayout>
    );
  }

  const filteredValue = (key: keyof Row) => (filtered.length ? avg(filtered, key).toFixed(1) : "—");

  return (
    <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
      <FilterBar values={filters} options={options} onChange={setFilters} />

      <aside className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-slate-600">
        <Info className="mt-0.5 size-4 shrink-0 text-indigo-500" aria-hidden="true" />
        <p>
          Este dashboard presenta un análisis exploratorio del dataset. Los resultados muestran
          asociaciones entre variables, no diagnósticos médicos ni relaciones causales.
        </p>
      </aside>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-sm text-slate-500 shadow-sm">
          No hay datos para los filtros seleccionados. Las vistas generales continúan mostrando el
          dataset completo.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Horas en redes"
          value={filteredValue("daily_social_media_hours")}
          unit={filtered.length ? "h/día" : undefined}
          accent="indigo"
        />
        <KPICard
          title="Sueño promedio diario"
          value={filteredValue("sleep_hours")}
          unit={filtered.length ? "h" : undefined}
          accent="violet"
        />
        <KPICard
          title="Pantalla antes de dormir"
          value={filteredValue("screen_time_before_sleep")}
          unit={filtered.length ? "h" : undefined}
          accent="amber"
        />
        <KPICard
          title="Ansiedad promedio"
          value={filteredValue("anxiety_level")}
          unit={filtered.length ? "/10" : undefined}
          accent="pink"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Horas promedio por plataforma" badge="Vista general">
          <ResponsiveContainer>
            <BarChart data={platformAvg}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="platform" tick={{ fontSize: 12, fill: COLORS.secondaryText }} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.secondaryText }} />
              <Tooltip />
              <Bar dataKey="horas" name="Horas promedio" radius={[6, 6, 0, 0]}>
                {platformAvg.map((entry, index) => (
                  <Cell
                    key={entry.platform}
                    fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Relación entre uso de redes sociales y horas de sueño">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis
                type="number"
                dataKey="x"
                name="Horas redes"
                tick={{ fontSize: 12, fill: COLORS.secondaryText }}
                label={{
                  value: "Horas redes",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 12,
                  fill: COLORS.secondaryText,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Sueño"
                tick={{ fontSize: 12, fill: COLORS.secondaryText }}
                label={{
                  value: "Horas sueño",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                  fill: COLORS.secondaryText,
                }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterSleep} fill={COLORS.violet} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Estrés y ansiedad por género" badge="Vista general">
          <ResponsiveContainer>
            <BarChart data={genderStress}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis dataKey="gender" tick={{ fontSize: 12, fill: COLORS.secondaryText }} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.secondaryText }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="estres" name="Estrés" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
              <Bar dataKey="ansiedad" name="Ansiedad" fill={COLORS.pink} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Relación entre uso de redes sociales y rendimiento académico">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
              <XAxis
                type="number"
                dataKey="x"
                name="Horas redes"
                tick={{ fontSize: 12, fill: COLORS.secondaryText }}
                label={{
                  value: "Horas redes",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 12,
                  fill: COLORS.secondaryText,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Rendimiento"
                tick={{ fontSize: 12, fill: COLORS.secondaryText }}
                label={{
                  value: "Rendimiento",
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                  fill: COLORS.secondaryText,
                }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterAcad} fill={COLORS.teal} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
