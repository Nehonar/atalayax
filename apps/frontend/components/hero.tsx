import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';
import { MetricCard } from './ui-shell';

const mailboxPreview = [
  'Alerta de vibración enviada al responsable de mantenimiento',
  'Informe diario recibido desde planta norte',
  'Incidencia de temperatura pendiente de revisión',
];

export function Hero() {
  return (
    <section className="mx-auto max-w-none px-3 py-16 sm:px-4 lg:px-6 sm:py-20">
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
            Plataforma de observabilidad y detección de deriva
          </span>
          <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Vigila tus datos industriales, detecta desviaciones y actúa antes del fallo.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">
            AtalayaX analiza señales de sensores de máquinas industriales en tiempo real o a posteriori a partir de ficheros XLS, CSV y conjuntos históricos. Identifica cambios de tendencia, deriva de proceso y comportamientos anómalos para anticipar incidencias y mejorar operación.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-neutral-900 shadow-lg shadow-white/10 transition hover:scale-[1.02]"
            >
              Solicitar demo
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-medium text-white/80 transition hover:bg-white/5"
            >
              Ver dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Procesos observados" value="128" hint="+18% este trimestre" />
            <MetricCard label="Alertas preventivas" value="2.431" hint="desviaciones detectadas" />
            <MetricCard label="Tiempo de reacción" value="-37%" hint="antes del umbral crítico" />
          </div>
        </div>

        <div className="relative min-w-0 w-full">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-fuchsia-500/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                <Lock className="h-3.5 w-3.5" />
                Secure login enabled
              </div>
            </div>

            <div className="grid min-w-0 gap-3 xl:grid-cols-[0.82fr_1.18fr]">
              <div className="min-w-0 rounded-3xl border border-white/10 bg-neutral-950/90 p-4 sm:p-5">
                <p className="text-sm font-medium text-white/85">Acceso seguro</p>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  Inicio de sesión robusto con separación clara entre interfaz, servicio de autenticación y gestión de sesiones por rol.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                    analyst@atalayax.io
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-white/45">
                    ••••••••••••••••
                  </div>
                  <Link
                    href="/login"
                    className="block w-full rounded-2xl bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:brightness-110"
                  >
                    Entrar al dashboard
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                  TLS, hash fuerte de contraseñas, sesiones seguras, RBAC y auditoría.
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-white/10 bg-neutral-950/90 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-white/50">Dashboard</p>
                    <h2 className="text-xl font-semibold">Vista operativa</h2>
                  </div>
                  <div className="shrink-0 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                    3 alertas activas
                  </div>
                </div>

                <div className="mt-5 grid gap-3 2xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm text-white/55">
                      <span>Motor línea 4</span>
                      <span className="text-rose-300">Deriva detectada</span>
                    </div>
                    <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(34,211,238,0.01))] p-3">
                      <div className="flex h-full items-end gap-2">
                        {[35, 42, 44, 47, 49, 52, 60, 71].map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-xl bg-cyan-300/70" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/55">Buzón interno</p>
                    <div className="mt-4 space-y-3">
                      {mailboxPreview.map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-white/70">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
