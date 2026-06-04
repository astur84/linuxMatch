import React, { useState } from "react";
import { supabase } from "../../const";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  
  const [mostrarMfa, setMostrarMfa] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 1. Autenticación inicial con usuario/contraseña
  const handleLoginInicial = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(loginError.message);
      return;
    }

    // Comprobamos si tiene el Doble Factor activo en Supabase
    const { data: mfaFactors, error: errFactors } = await supabase.auth.mfa.listFactors();

    if (errFactors) {
      setError(errFactors.message);
      return;
    }

    // Si tiene TOTP configurado, saltamos al segundo paso (pedir token)
    if (mfaFactors && mfaFactors.totp.length > 0) {
      setFactorId(mfaFactors.totp[0].id);
      setMostrarMfa(true);
      return;
    }

    // Si no tiene MFA, entra directo al Home de DistroMatch
    window.location.href = "/";
  };

  // 2. Verificación del segundo factor (TOTP)
  const handleVerificarMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factorId,
    });

    if (challengeError) {
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factorId,
      challengeId: challengeData.id,
      code: mfaToken,
    });

    if (verifyError) {
      setError("Código de verificación incorrecto o expirado.");
      return;
    }

    // Éxito. Sesión autorizada con nivel AAL2 (MFA verificado)
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        {!mostrarMfa ? (
          <form onSubmit={handleLoginInicial} className="space-y-4">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
              <p className="text-sm text-zinc-400">Accede directamente usando tu cuenta de Supabase</p>
            </div>
            {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded border border-zinc-700 bg-zinc-800 p-2.5 text-sm outline-none text-white focus:border-blue-500" placeholder="ejemplo@correo.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded border border-zinc-700 bg-zinc-800 p-2.5 text-sm outline-none text-white focus:border-blue-500" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full rounded bg-blue-600 p-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
              Iniciar Sesión
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificarMfa} className="space-y-4">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Doble Factor (MFA)</h1>
              <p className="text-sm text-zinc-400">Introduce el código de 6 dígitos de tu aplicación de autenticación</p>
            </div>
            {error && <div className="rounded bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">{error}</div>}
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-300">Código de seguridad</label>
              <input type="text" maxLength={6} placeholder="000000" value={mfaToken} onChange={(e) => setMfaToken(e.target.value)} required className="w-full text-center tracking-widest text-lg rounded border border-zinc-700 bg-zinc-800 p-2.5 outline-none text-white focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full rounded bg-green-600 p-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors">
              Verificar Código
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
