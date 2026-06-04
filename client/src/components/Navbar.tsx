import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, Terminal } from "lucide-react";
import { Link } from "wouter";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      style={{ backgroundColor: "#202020", borderBottom: "1px solid #373737" }}
      className="h-16 flex items-center px-6 justify-between sticky top-0 z-50"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 no-underline">
        <div
          style={{ backgroundColor: "#2E96FF" }}
          className="w-8 h-8 flex items-center justify-center"
        >
          <Terminal size={16} color="white" />
        </div>
        <span className="font-bold text-lg tracking-wide text-white">
          Distro<span style={{ color: "#2E96FF" }}>Match</span>
        </span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <span
              style={{ color: "#808080" }}
              className="text-sm hidden sm:block"
            >
              {user?.name ?? user?.email ?? "Admin"}
            </span>
            <Link href="/admin">
              <button
                style={{
                  backgroundColor: "#2E96FF",
                  border: "none",
                  color: "white",
                }}
                className="flex items-center gap-2 px-4 h-9 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Plus size={15} />
                Añadir Distro
              </button>
            </Link>
            <button
              onClick={() => logout()}
              style={{
                border: "1px solid #373737",
                backgroundColor: "transparent",
                color: "#808080",
              }}
              className="px-4 h-9 text-sm hover:text-white hover:border-white transition-colors cursor-pointer"
            >
              Salir
            </button>
          </>
        ) : (
          /* Cambiado a Link de wouter apuntando a la ruta interna /login */
          <Link
            href="/login"
            style={{
              border: "1px solid #373737",
              color: "#2E96FF",
            }}
            className="px-4 h-9 text-sm flex items-center hover:border-[#2E96FF] transition-colors no-underline cursor-pointer"
          >
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
}
