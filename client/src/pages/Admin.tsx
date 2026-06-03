import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DistroForm {
  name: string;
  description: string;
  category: string;
  ramMin: number;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  purpose: "General" | "Gaming" | "Servidores" | "Seguridad" | "PCs Antiguos";
  architecture: "64-bit" | "ARM64" | "32-bit";
  logoUrl: string;
}

const EMPTY_FORM: DistroForm = {
  name: "",
  description: "",
  category: "General",
  ramMin: 1024,
  difficulty: "Principiante",
  purpose: "General",
  architecture: "64-bit",
  logoUrl: "",
};

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<DistroForm>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: distros, isLoading: listLoading } = trpc.distros.list.useQuery(
    {},
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const createMutation = trpc.distros.create.useMutation({
    onSuccess: () => {
      toast.success("Distribución creada correctamente.");
      utils.distros.list.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.distros.update.useMutation({
    onSuccess: () => {
      toast.success("Distribución actualizada correctamente.");
      utils.distros.list.invalidate();
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.distros.delete.useMutation({
    onSuccess: () => {
      toast.success("Distribución eliminada.");
      utils.distros.list.invalidate();
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const wikiMutation = trpc.distros.fetchWikipedia.useMutation({
    onSuccess: (data) => {
      if (data.found && data.description) {
        setForm((prev) => ({ ...prev, description: data.description }));
        toast.success("Descripción cargada desde Wikipedia.");
      } else {
        toast.error("No se encontró información en Wikipedia.");
      }
    },
    onError: () => toast.error("Error al consultar Wikipedia."),
  });

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
  }

  function handleEdit(d: NonNullable<typeof distros>[0]) {
    setForm({
      name: d.name,
      description: d.description,
      category: d.category,
      ramMin: d.ramMin,
      difficulty: d.difficulty,
      purpose: d.purpose,
      architecture: d.architecture,
      logoUrl: d.logoUrl ?? "",
    });
    setEditId(d.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      ramMin: form.ramMin,
      difficulty: form.difficulty,
      purpose: form.purpose,
      architecture: form.architecture,
      logoUrl: form.logoUrl || null,
    };
    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ─── Auth guard ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#262626" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "#2E96FF" }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: "#262626" }}>
        <Terminal size={48} style={{ color: "#373737" }} />
        <p className="text-white text-lg font-medium">Acceso restringido</p>
        <p style={{ color: "#808080" }} className="text-sm">Debes iniciar sesión para acceder al panel de administración.</p>
        <a
          href={getLoginUrl()}
          className="px-6 py-3 text-sm font-medium text-white no-underline"
          style={{ backgroundColor: "#2E96FF" }}
        >
          Iniciar Sesión
        </a>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ backgroundColor: "#262626" }}>
        <AlertCircle size={48} style={{ color: "#C7162B" }} />
        <p className="text-white text-lg font-medium">Sin permisos de administrador</p>
        <p style={{ color: "#808080" }} className="text-sm">Tu cuenta no tiene permisos para acceder a esta sección.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#1e1e1e", minHeight: "100vh", padding: "2rem 1.5rem" }}>
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-white mb-1">Panel de Administración</h1>
            <p style={{ color: "#808080" }} className="text-sm">
              Gestiona el catálogo de distribuciones Linux
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#0E8420" }}
            >
              <Plus size={15} />
              Nueva Distribución
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div
            className="mb-8 p-6 animate-fade-in-up"
            style={{ backgroundColor: "#2F2F2F", border: "1px solid #373737" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-white">
                {editId !== null ? "Editar Distribución" : "Nueva Distribución"}
              </h2>
              <button
                onClick={resetForm}
                style={{ color: "#808080", background: "none", border: "none", cursor: "pointer" }}
                className="hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Wikipedia */}
              <div>
                <label className="block text-sm mb-2" style={{ color: "#aaa" }}>
                  Nombre de la Distribución *
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Arch Linux"
                    className="flex-1 px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none"
                    style={{ backgroundColor: "#262626", border: "1px solid #373737" }}
                  />
                  <button
                    type="button"
                    disabled={!form.name || wikiMutation.isPending}
                    onClick={() => wikiMutation.mutate({ name: form.name })}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white whitespace-nowrap transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "#2E96FF" }}
                  >
                    {wikiMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    {wikiMutation.isPending ? "Buscando..." : "Autocargar Info"}
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm mb-2" style={{ color: "#aaa" }}>
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descripción de la distribución..."
                  className="w-full px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none resize-y"
                  style={{ backgroundColor: "#262626", border: "1px solid #373737" }}
                />
              </div>

              {/* Row: Category + RAM */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Categoría *">
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Ej: General, Gaming..."
                    className="w-full px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none"
                    style={{ backgroundColor: "#262626", border: "1px solid #373737" }}
                  />
                </FormField>
                <FormField label="RAM Mínima (MB) *">
                  <input
                    type="number"
                    required
                    min={64}
                    max={65536}
                    value={form.ramMin}
                    onChange={(e) => setForm((p) => ({ ...p, ramMin: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 text-sm text-white focus:outline-none"
                    style={{ backgroundColor: "#262626", border: "1px solid #373737" }}
                  />
                </FormField>
              </div>

              {/* Row: Difficulty + Purpose + Architecture */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Dificultad *">
                  <SelectInput
                    value={form.difficulty}
                    onChange={(v) => setForm((p) => ({ ...p, difficulty: v as DistroForm["difficulty"] }))}
                    options={["Principiante", "Intermedio", "Avanzado"]}
                  />
                </FormField>
                <FormField label="Propósito *">
                  <SelectInput
                    value={form.purpose}
                    onChange={(v) => setForm((p) => ({ ...p, purpose: v as DistroForm["purpose"] }))}
                    options={["General", "Gaming", "Servidores", "Seguridad", "PCs Antiguos"]}
                  />
                </FormField>
                <FormField label="Arquitectura *">
                  <SelectInput
                    value={form.architecture}
                    onChange={(v) => setForm((p) => ({ ...p, architecture: v as DistroForm["architecture"] }))}
                    options={["64-bit", "ARM64", "32-bit"]}
                  />
                </FormField>
              </div>

              {/* Logo URL (optional) */}
              <FormField label="URL del Logo (opcional)">
                <input
                  type="url"
                  value={form.logoUrl}
                  onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none"
                  style={{ backgroundColor: "#262626", border: "1px solid #373737" }}
                />
              </FormField>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#0E8420" }}
                >
                  {isSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {editId !== null ? "Actualizar Distribución" : "Guardar Distribución"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 text-sm transition-colors"
                  style={{ border: "1px solid #373737", backgroundColor: "transparent", color: "#808080" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = "#808080";
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Distros table */}
        <div style={{ border: "1px solid #373737" }}>
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid #373737", backgroundColor: "#2F2F2F" }}
          >
            <span className="text-sm font-medium text-white">
              Distribuciones ({distros?.length ?? 0})
            </span>
          </div>

          {listLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin" style={{ color: "#2E96FF" }} />
            </div>
          ) : !distros || distros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Terminal size={32} style={{ color: "#373737" }} />
              <p style={{ color: "#808080" }} className="text-sm">
                No hay distribuciones. Crea la primera.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #373737" }}>
                    {["Nombre", "Categoría", "RAM", "Dificultad", "Propósito", "Arquitectura", "Acciones"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-medium tracking-wider"
                        style={{ color: "#808080", backgroundColor: "#262626" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {distros.map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom: i < distros.length - 1 ? "1px solid #373737" : "none",
                        backgroundColor: "#2F2F2F",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#333";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#2F2F2F";
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-white">{d.name}</td>
                      <td className="px-4 py-3" style={{ color: "#aaa" }}>{d.category}</td>
                      <td className="px-4 py-3" style={{ color: "#aaa" }}>
                        {d.ramMin >= 1024 ? `${d.ramMin / 1024} GB` : `${d.ramMin} MB`}
                      </td>
                      <td className="px-4 py-3">
                        <DifficultyBadge value={d.difficulty} />
                      </td>
                      <td className="px-4 py-3" style={{ color: "#aaa" }}>{d.purpose}</td>
                      <td className="px-4 py-3" style={{ color: "#aaa" }}>{d.architecture}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-1.5 transition-colors"
                            style={{ color: "#2E96FF", background: "none", border: "none", cursor: "pointer" }}
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          {deleteConfirm === d.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteMutation.mutate({ id: d.id })}
                                disabled={deleteMutation.isPending}
                                className="text-xs px-2 py-1 text-white"
                                style={{ backgroundColor: "#C7162B", border: "none", cursor: "pointer" }}
                              >
                                {deleteMutation.isPending ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs px-2 py-1"
                                style={{ border: "1px solid #555", background: "none", color: "#aaa", cursor: "pointer" }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(d.id)}
                              className="p-1.5 transition-colors"
                              style={{ color: "#C7162B", background: "none", border: "none", cursor: "pointer" }}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm mb-2" style={{ color: "#aaa" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectInput({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 text-sm text-white focus:outline-none"
      style={{ backgroundColor: "#262626", border: "1px solid #373737" }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function DifficultyBadge({ value }: { value: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Principiante: { bg: "rgba(14,132,32,0.18)", text: "#4ade80" },
    Intermedio:   { bg: "rgba(46,150,255,0.18)", text: "#2E96FF" },
    Avanzado:     { bg: "rgba(199,22,43,0.18)", text: "#f87171" },
  };
  const c = colors[value] ?? colors.Principiante;
  return (
    <span
      className="text-xs px-2 py-0.5 font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {value}
    </span>
  );
}
