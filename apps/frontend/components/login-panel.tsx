'use client';

import type { FormEvent } from 'react';
import { startTransition, useState } from 'react';
import { ArrowRight, Lock, ShieldCheck, UserCog } from 'lucide-react';
import type { UserRole } from '@atalayax/types';
import { login } from '../lib/api';
import { writeSession } from '../lib/auth';
import { RoleChip } from './ui-shell';

const demoUsers: Array<{ role: UserRole; email: string; password: string; label: string }> = [
  { role: 'admin', email: 'admin@atalayax.io', password: 'AtalayaX-demo!', label: 'Administrador' },
  { role: 'analyst', email: 'analyst@atalayax.io', password: 'AtalayaX-demo!', label: 'Analista' },
  { role: 'operator', email: 'operator@atalayax.io', password: 'AtalayaX-demo!', label: 'Operador' },
];

type LoginPanelProps = {
  onAuthenticated: () => void;
};

export function LoginPanel({ onAuthenticated }: LoginPanelProps) {
  const [email, setEmail] = useState(demoUsers[1].email);
  const [password, setPassword] = useState(demoUsers[1].password);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const activeRole = demoUsers.find((user) => user.email === email)?.role ?? 'analyst';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const session = await login({ email, password });
      writeSession(session);
      startTransition(() => {
        onAuthenticated();
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="grid gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
              <Lock className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-sm text-white/45">Acceso de demostración</p>
              <h1 className="text-3xl font-semibold tracking-tight">Acceder a la demo</h1>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {demoUsers.map((user) => (
              <RoleChip
                key={user.role}
                active={activeRole === user.role}
                onClick={() => {
                  setEmail(user.email);
                  setPassword(user.password);
                }}
              >
                {user.label}
              </RoleChip>
            ))}
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-white/60">Correo</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/60">Contraseña</span>
              <input
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-300/40"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Entrando...' : 'Acceder a la demo'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
            TLS, hash fuerte de contraseñas, sesiones seguras, RBAC y auditoría.
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-fuchsia-500/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Role-aware session demo
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-950/90 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/50">Accesos de prueba</p>
                  <h2 className="text-xl font-semibold">Usuarios demo por rol</h2>
                </div>
                <div className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                  3 perfiles activos
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {demoUsers.map((user) => (
                  <button
                    key={user.role}
                    type="button"
                    onClick={() => {
                      setEmail(user.email);
                      setPassword(user.password);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"
                  >
                    <div>
                      <p className="text-sm text-white/55">{user.email}</p>
                      <p className="mt-1 text-base font-semibold text-white/90">{user.label}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-cyan-200">
                      <UserCog className="h-3.5 w-3.5" />
                      {user.role}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                Demo visual de auth con sesión local temporal. La siguiente fase sustituye esto por sesión segura real con cookies o tokens endurecidos.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
