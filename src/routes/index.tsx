import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter,
} from "recharts";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";
import { FilterBar, type FilterValues } from "../components/dashboard/FilterBar";
import { KPICard } from "../components/dashboard/KPICard";
import { ChartCard } from "../components/dashboard/ChartCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Impacto de redes sociales en el bienestar adolescente" },
      { name: "description", content: "Dashboard exploratorio del uso de redes sociales y el bienestar adolescente." },
      { property: "og:title", content: "Impacto de redes sociales en el bienestar adolescente" },
      { property: "og:description", content: "Dashboard exploratorio del uso de redes sociales y el bienestar adolescente." },
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
  blue: "#3b82f6",
  orange: "#f59e0b",
  pink: "#ec4899",
  purple: "#8b5cf6",
};

function avg(rows: Row[], key: keyof Row): number {
  if (!rows.length) return 0;
  const nums = rows.map((r) => Number(r[key])).filter((n) => !isNaN(n));
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function uniqueSorted<T>(arr: T[]): T[] {
  return Array.from(new Set(arr)).sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function Index() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    age: "", gender: "", platform: "", interaction: "",
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

  const options = useMemo(() => ({
    ages: rows ? uniqueSorted(rows.map((r) => String(r.age))) : [],
    genders: rows ? uniqueSorted(rows.map((r) => r.gender)) : [],
    platforms: rows ? uniqueSorted(rows.map((r) => r.platform_usage)) : [],
    interactions: rows ? uniqueSorted(rows.map((r) => r.social_interaction_level)) : [],
  }), [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) =>
      (!filters.age || String(r.age) === filters.age) &&
      (!filters.gender || r.gender === filters.gender) &&
      (!filters.platform || r.platform_usage === filters.platform) &&
      (!filters.interaction || r.social_interaction_level === filters.interaction)
    );
  }, [rows, filters]);

  const platformAvg = useMemo(() => {
    const map = new Map<string, number[]>();
    filtered.forEach((r) => {
      const arr = map.get(r.platform_usage) ?? [];
      arr.push(r.daily_social_media_hours);
      map.set(r.platform_usage, arr);
    });
    return Array.from(map.entries()).map(([platform, arr]) => ({
      platform,
      horas: +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2),
    }));
  }, [filtered]);

  const genderStress = useMemo(() => {
    const map = new Map<string, { s: number[]; a: number[] }>();
    filtered.forEach((r) => {
      const cur = map.get(r.gender) ?? { s: [], a: [] };
      cur.s.push(r.stress_level);
      cur.a.push(r.anxiety_level);
      map.set(r.gender, cur);
    });
    return Array.from(map.entries()).map(([gender, { s, a }]) => ({
      gender,
      estres: +(s.reduce((x, y) => x + y, 0) / s.length).toFixed(2),
      ansiedad: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2),
    }));
  }, [filtered]);

  const scatterSleep = filtered.map((r) => ({ x: r.daily_social_media_hours, y: r.sleep_hours }));
  const scatterAcad = filtered.map((r) => ({ x: r.daily_social_media_hours, y: r.academic_performance }));

  if (error) {
    return (
      <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
        <div className="bg-white rounded-2xl p-8 text-center text-gray-600 shadow-sm">
          No se pudo cargar el archivo <code>/data/teen_subset.csv</code>. {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!rows) {
    return (
      <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
        <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm">Cargando datos…</div>
      </DashboardLayout>
    );
  }

  if (filtered.length === 0) {
    return (
      <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
        <FilterBar values={filters} options={options} onChange={setFilters} />
        <div className="bg-white rounded-2xl p-8 text-center text-gray-500 shadow-sm">
          No hay datos para los filtros seleccionados.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Impacto del uso de redes sociales en el bienestar adolescente">
      <FilterBar values={filters} options={options} onChange={setFilters} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Horas en redes" value={avg(filtered, "daily_social_media_hours").toFixed(1)} unit="h/día" accent="blue" />
        <KPICard title="Sueño promedio diario" value={avg(filtered, "sleep_hours").toFixed(1)} unit="h" accent="purple" />
        <KPICard title="Pantalla antes de dormir" value={avg(filtered, "screen_time_before_sleep").toFixed(1)} unit="h" accent="orange" />
        <KPICard title="Ansiedad promedio" value={avg(filtered, "anxiety_level").toFixed(1)} unit="/10" accent="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Horas promedio por plataforma">
          <ResponsiveContainer>
            <BarChart data={platformAvg}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="horas" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Relación entre uso de redes sociales y horas de sueño">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" dataKey="x" name="Horas redes" tick={{ fontSize: 12 }} label={{ value: "Horas redes", position: "insideBottom", offset: -5, fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Sueño" tick={{ fontSize: 12 }} label={{ value: "Horas sueño", angle: -90, position: "insideLeft", fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterSleep} fill={COLORS.purple} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Estrés y ansiedad por género">
          <ResponsiveContainer>
            <BarChart data={genderStress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="gender" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="estres" name="Estrés" fill={COLORS.orange} radius={[6, 6, 0, 0]} />
              <Bar dataKey="ansiedad" name="Ansiedad" fill={COLORS.pink} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Relación entre uso de redes sociales y rendimiento académico">
          <ResponsiveContainer>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" dataKey="x" name="Horas redes" tick={{ fontSize: 12 }} label={{ value: "Horas redes", position: "insideBottom", offset: -5, fontSize: 12 }} />
              <YAxis type="number" dataKey="y" name="Rendimiento" tick={{ fontSize: 12 }} label={{ value: "Rendimiento", angle: -90, position: "insideLeft", fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterAcad} fill={COLORS.blue} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2 px-4">
        Nota: Este dashboard presenta un análisis exploratorio del dataset. Los resultados muestran asociaciones entre variables, no diagnósticos médicos ni relaciones causales.
      </p>
    </DashboardLayout>
  );
}
