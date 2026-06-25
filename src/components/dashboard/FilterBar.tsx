interface FilterValues {
  age: string;
  gender: string;
  platform: string;
  interaction: string;
}

interface Options {
  ages: string[];
  genders: string[];
  platforms: string[];
  interactions: string[];
}

interface Props {
  values: FilterValues;
  options: Options;
  onChange: (v: FilterValues) => void;
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex min-w-[140px] flex-1 flex-col gap-1">
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterBar({ values, options, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Select
        label="Edad"
        value={values.age}
        options={options.ages}
        onChange={(v) => onChange({ ...values, age: v })}
      />
      <Select
        label="Género"
        value={values.gender}
        options={options.genders}
        onChange={(v) => onChange({ ...values, gender: v })}
      />
      <Select
        label="Plataforma"
        value={values.platform}
        options={options.platforms}
        onChange={(v) => onChange({ ...values, platform: v })}
      />
      <Select
        label="Interacción social"
        value={values.interaction}
        options={options.interactions}
        onChange={(v) => onChange({ ...values, interaction: v })}
      />
    </div>
  );
}

export type { FilterValues, Options };
