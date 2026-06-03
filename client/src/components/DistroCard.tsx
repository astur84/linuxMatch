import { Cpu, HardDrive, Monitor, Tag, Zap } from "lucide-react";

interface DistroCardProps {
  name: string;
  description: string;
  category: string;
  ramMin: number;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  purpose: "General" | "Gaming" | "Servidores" | "Seguridad" | "PCs Antiguos";
  architecture: "64-bit" | "ARM64" | "32-bit";
  style?: React.CSSProperties;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Principiante: { bg: "rgba(14,132,32,0.18)", text: "#4ade80" },
  Intermedio:   { bg: "rgba(46,150,255,0.18)", text: "#2E96FF" },
  Avanzado:     { bg: "rgba(199,22,43,0.18)", text: "#f87171" },
};

const PURPOSE_ICONS: Record<string, string> = {
  General:       "🖥️",
  Gaming:        "🎮",
  Servidores:    "🖧",
  Seguridad:     "🔒",
  "PCs Antiguos": "♻️",
};

function formatRam(mb: number): string {
  if (mb >= 1024) return `${mb / 1024} GB`;
  return `${mb} MB`;
}

export default function DistroCard({
  name, description, category, ramMin, difficulty, purpose, architecture, style,
}: DistroCardProps) {
  const diffColor = DIFFICULTY_COLORS[difficulty] ?? DIFFICULTY_COLORS.Principiante;

  return (
    <div
      className="animate-fade-in-up flex flex-col h-full transition-all duration-200 group"
      style={{
        backgroundColor: "#2F2F2F",
        border: "1px solid #373737",
        padding: "1.5rem",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#2E96FF";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#373737";
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-xl font-medium text-white leading-tight">{name}</h3>
        <span
          className="text-xs px-2 py-1 font-medium shrink-0"
          style={{ backgroundColor: diffColor.bg, color: diffColor.text }}
        >
          {difficulty}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-sm leading-6 mb-5 flex-1 line-clamp-3"
        style={{ color: "#808080" }}
      >
        {description}
      </p>

      {/* Meta grid */}
      <div
        className="grid grid-cols-2 gap-2 pt-4"
        style={{ borderTop: "1px solid #373737" }}
      >
        <MetaItem icon={<Tag size={12} />} label="Categoría" value={category} />
        <MetaItem icon={<HardDrive size={12} />} label="RAM mín." value={formatRam(ramMin)} />
        <MetaItem
          icon={<span className="text-xs">{PURPOSE_ICONS[purpose]}</span>}
          label="Propósito"
          value={purpose}
        />
        <MetaItem icon={<Cpu size={12} />} label="Arquitectura" value={architecture} />
      </div>
    </div>
  );
}

function MetaItem({
  icon, label, value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span style={{ color: "#2E96FF" }} className="shrink-0">{icon}</span>
      <span style={{ color: "#808080" }} className="text-xs shrink-0">{label}:</span>
      <span className="text-xs text-white truncate font-medium">{value}</span>
    </div>
  );
}
