import { SlidersHorizontal } from "lucide-react";

export interface Filters {
  search: string;
  ramMax: number;
  difficulty: string;
  purpose: string;
  architecture: string;
}

interface FilterPanelProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const RAM_OPTIONS = [128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768];

function formatRam(mb: number): string {
  if (mb >= 1024) return `${mb / 1024} GB`;
  return `${mb} MB`;
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const set = (key: keyof Filters, value: string | number) =>
    onChange({ ...filters, [key]: value });

  return (
    <aside
      style={{
        backgroundColor: "#2F2F2F",
        border: "1px solid #373737",
        padding: "1.25rem",
        width: "220px",
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal size={14} style={{ color: "#2E96FF" }} />
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#808080" }}>
          Filtros
        </span>
      </div>

      {/* RAM slider */}
      <FilterSection label="RAM Mínima">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: "#808080" }}>Hasta</span>
          <span className="text-xs font-medium" style={{ color: "#2E96FF" }}>
            {filters.ramMax === 0 ? "Cualquiera" : formatRam(filters.ramMax)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={RAM_OPTIONS.length - 1}
          step={1}
          value={filters.ramMax === 0 ? 0 : RAM_OPTIONS.indexOf(filters.ramMax) === -1 ? 0 : RAM_OPTIONS.indexOf(filters.ramMax)}
          onChange={(e) => {
            const idx = Number(e.target.value);
            set("ramMax", idx === 0 ? 0 : RAM_OPTIONS[idx]);
          }}
          className="w-full"
          style={{ accentColor: "#2E96FF" }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: "#555" }}>Cualquiera</span>
          <span className="text-xs" style={{ color: "#555" }}>32 GB</span>
        </div>
      </FilterSection>

      {/* Difficulty */}
      <FilterSection label="Dificultad">
        <SelectFilter
          value={filters.difficulty}
          onChange={(v) => set("difficulty", v)}
          options={[
            { value: "", label: "Todas las dificultades" },
            { value: "Principiante", label: "Principiante (Fácil)" },
            { value: "Intermedio", label: "Intermedio" },
            { value: "Avanzado", label: "Avanzado (Experto)" },
          ]}
        />
      </FilterSection>

      {/* Purpose */}
      <FilterSection label="Propósito / Uso">
        <SelectFilter
          value={filters.purpose}
          onChange={(v) => set("purpose", v)}
          options={[
            { value: "", label: "Todos los usos" },
            { value: "General", label: "Uso General diario" },
            { value: "Gaming", label: "Gaming / Juegos" },
            { value: "Servidores", label: "Servidores" },
            { value: "Seguridad", label: "Seguridad / Auditoría" },
            { value: "PCs Antiguos", label: "PCs Antiguos / Ligeros" },
          ]}
        />
      </FilterSection>

      {/* Architecture */}
      <FilterSection label="Arquitectura CPU" last>
        <SelectFilter
          value={filters.architecture}
          onChange={(v) => set("architecture", v)}
          options={[
            { value: "", label: "Todas las arquitecturas" },
            { value: "64-bit", label: "64-bit (x86_64)" },
            { value: "ARM64", label: "ARM64 (Raspberry Pi / Mac M1+)" },
            { value: "32-bit", label: "32-bit antiguos (i386/i686)" },
          ]}
        />
      </FilterSection>

      {/* Reset */}
      {(filters.difficulty || filters.purpose || filters.architecture || filters.ramMax > 0) && (
        <button
          onClick={() =>
            onChange({ search: filters.search, ramMax: 0, difficulty: "", purpose: "", architecture: "" })
          }
          className="w-full mt-4 py-2 text-xs font-medium transition-colors"
          style={{
            border: "1px solid #373737",
            backgroundColor: "transparent",
            color: "#808080",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "white";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#555";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#808080";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#373737";
          }}
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}

function FilterSection({
  label, children, last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={last ? "" : "mb-5 pb-5"}
      style={last ? {} : { borderBottom: "1px solid #373737" }}
    >
      <label className="block text-xs font-medium mb-2" style={{ color: "#aaa" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectFilter({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs py-2 px-2"
      style={{
        backgroundColor: "#262626",
        border: "1px solid #373737",
        color: value ? "white" : "#808080",
        appearance: "auto",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
