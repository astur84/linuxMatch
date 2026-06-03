import DistroCard from "@/components/DistroCard";
import FilterPanel, { Filters } from "@/components/FilterPanel";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Search, SlidersHorizontal, Terminal, X } from "lucide-react";
import { useCallback, useState } from "react";

const DEFAULT_FILTERS: Filters = {
  search: "",
  ramMax: 0,
  difficulty: "",
  purpose: "",
  architecture: "",
};

export default function Home() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [inputValue, setInputValue] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    setInputValue(value);
    setFilters((prev) => ({ ...prev, search: value }));
  }, []);

  const { data: distros, isLoading, isError } = trpc.distros.list.useQuery(
    {
      search: filters.search || undefined,
      ramMax: filters.ramMax > 0 ? filters.ramMax : undefined,
      difficulty: filters.difficulty || undefined,
      purpose: filters.purpose || undefined,
      architecture: filters.architecture || undefined,
    },
    { refetchOnWindowFocus: false }
  );

  const hasActiveFilters =
    filters.search || filters.ramMax > 0 || filters.difficulty || filters.purpose || filters.architecture;

  return (
    <div style={{ backgroundColor: "#1e1e1e", minHeight: "100vh" }}>
      {/* Search bar */}
      <div style={{ borderBottom: "1px solid #373737" }} className="px-4 sm:px-6 py-2 flex items-center gap-3">
        <Search size={16} style={{ color: "#555", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Busca tu distribución Linux ideal..."
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 py-3 text-sm text-white placeholder:text-[#555] focus:outline-none bg-transparent border-none"
        />
        {/* Mobile filter toggle */}
        <button
          className="md:hidden flex items-center gap-1.5 text-xs px-3 py-2 transition-colors"
          style={{
            border: "1px solid #373737",
            backgroundColor: hasActiveFilters ? "rgba(46,150,255,0.1)" : "transparent",
            color: hasActiveFilters ? "#2E96FF" : "#808080",
          }}
          onClick={() => setMobileFiltersOpen(true)}
        >
          <SlidersHorizontal size={13} />
          Filtros
          {hasActiveFilters && (
            <span
              className="w-4 h-4 flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "#2E96FF", color: "white" }}
            >
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile filters overlay */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 overflow-y-auto"
            style={{ backgroundColor: "#1e1e1e" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid #373737" }}
            >
              <span className="text-sm font-medium text-white">Filtros</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                style={{ color: "#808080", background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                filters={filters}
                onChange={(f) => { setFilters(f); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex" style={{ minHeight: "calc(100vh - 112px)" }}>
        {/* Sidebar filters — desktop only */}
        <div className="hidden md:block p-4 shrink-0">
          <FilterPanel filters={filters} onChange={setFilters} />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 min-w-0">
          {/* Results header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs" style={{ color: "#555" }}>
              {isLoading
                ? "Cargando..."
                : isError
                ? "Error al cargar"
                : `${distros?.length ?? 0} distribución${(distros?.length ?? 0) !== 1 ? "es" : ""} encontrada${(distros?.length ?? 0) !== 1 ? "s" : ""}`}
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => { setFilters(DEFAULT_FILTERS); setInputValue(""); }}
                className="text-xs transition-colors"
                style={{ color: "#2E96FF", background: "none", border: "none", cursor: "pointer" }}
              >
                Limpiar todo
              </button>
            )}
          </div>

          {/* States */}
          {isLoading ? (
            <SkeletonGrid />
          ) : isError ? (
            <ErrorState />
          ) : distros && distros.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {distros.map((d, i) => (
                <DistroCard
                  key={d.id}
                  name={d.name}
                  description={d.description}
                  category={d.category}
                  ramMin={d.ramMin}
                  difficulty={d.difficulty}
                  purpose={d.purpose}
                  architecture={d.architecture}
                  style={{ animationDelay: `${i * 30}ms` }}
                />
              ))}
            </div>
          ) : (
            <EmptyState hasFilters={!!hasActiveFilters} />
          )}
        </main>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="skeleton h-52" style={{ border: "1px solid #373737" }} />
      ))}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      style={{ border: "1px solid #373737", backgroundColor: "#2F2F2F" }}
    >
      <Terminal size={40} style={{ color: "#373737" }} className="mb-4" />
      <p className="text-base font-medium text-white mb-2">
        {hasFilters
          ? "No se han encontrado distribuciones que cumplan los criterios seleccionados."
          : "No hay distribuciones disponibles aún."}
      </p>
      <p className="text-sm" style={{ color: "#555" }}>
        {hasFilters
          ? "Prueba a ajustar o limpiar los filtros."
          : "El administrador puede añadir distribuciones desde el panel de administración."}
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-24 text-center"
      style={{ border: "1px solid #373737", backgroundColor: "#2F2F2F" }}
    >
      <AlertCircle size={40} style={{ color: "#C7162B" }} className="mb-4" />
      <p className="text-base font-medium text-white mb-2">Error al cargar las distribuciones</p>
      <p className="text-sm" style={{ color: "#555" }}>
        No se pudo conectar con el servidor. Intenta recargar la página.
      </p>
    </div>
  );
}
