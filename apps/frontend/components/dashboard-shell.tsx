'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  LineChart,
  LogOut,
  Mail,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import type { AuthSessionDto, DashboardOverviewDto, UserRole } from '@atalayax/types';
import { getDashboardOverview } from '../lib/api';
import { clearSession } from '../lib/auth';
import { MetricCard, RoleChip } from './ui-shell';

const roleAccent = {
  admin: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  analyst: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-50',
  operator: 'border-amber-400/20 bg-amber-400/10 text-amber-50',
} as const;

const roleCopy = {
  admin: {
    title: 'Vista de gobierno y seguridad',
    label: 'Administrador',
    icon: ShieldCheck,
  },
  analyst: {
    title: 'Vista de análisis y deriva',
    label: 'Analista',
    icon: LineChart,
  },
  operator: {
    title: 'Vista operativa en tiempo real',
    label: 'Operador',
    icon: Wrench,
  },
} as const;

const mailExperienceByRole = {
  admin: {
    title: 'Correo cliente e interno',
    helper: 'Puede redactar mensajes a clientes, revisar respuestas y mantener coordinación interna.',
    folders: ['Inbox', 'Sent', 'Drafts'],
    composeLabel: 'Redactar email',
  },
  analyst: {
    title: 'Correo con clientes',
    helper: 'Puede compartir informes, responder consultas y mantener seguimiento interno del análisis.',
    folders: ['Inbox', 'Sent', 'Drafts'],
    composeLabel: 'Nuevo mensaje',
  },
  operator: {
    title: 'Correo interno',
    helper: 'Solo dispone de mensajería interna operativa para coordinación con mantenimiento y turnos.',
    folders: ['Inbox', 'Drafts'],
    composeLabel: 'Nuevo interno',
  },
} as const;

const mailTagTone = {
  sales: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  support: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
  ops: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  audit: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  report: 'border-white/10 bg-white/5 text-white/80',
} as const;

type DashboardShellProps = {
  session: AuthSessionDto;
  onLogout: () => void;
};

export function DashboardShell({ session, onLogout }: DashboardShellProps) {
  const [overview, setOverview] = useState<DashboardOverviewDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(session.user.role);

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError('');

      try {
        const nextOverview = await getDashboardOverview(selectedRole);

        if (active) {
          setOverview(nextOverview);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el dashboard');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOverview();

    return () => {
      active = false;
    };
  }, [selectedRole]);

  const currentRole = useMemo(() => selectedRole, [selectedRole]);
  const RoleIcon = roleCopy[currentRole].icon;
  const mailExperience = mailExperienceByRole[currentRole];

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white/70">Cargando dashboard...</div>
      </section>
    );
  }

  if (!overview) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="rounded-[2rem] border border-rose-400/20 bg-rose-400/10 p-8 text-rose-50">
          {error || 'No se pudo cargar el dashboard'}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-none px-3 py-16 sm:px-4 lg:px-6 sm:py-20">
      <div className="grid gap-8 xl:grid-cols-[0.88fr_1.12fr] xl:items-start">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
            Dashboard autenticado con vistas por rol y experiencia de correo propia
          </span>
          <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Observa alertas, tendencias y correo operativo con la misma estética de producto.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">
            Esta vista te permite recorrer la experiencia de AtalayaX tras autenticación, alternando perfiles y viendo cómo cambia el dashboard según el rol operativo seleccionado, incluido el acceso al correo externo o interno.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => {
                clearSession();
                onLogout();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-neutral-900 shadow-lg shadow-white/10 transition hover:scale-[1.02]"
            >
              Cerrar sesión
              <LogOut className="h-4 w-4" />
            </button>
            <div className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm ${roleAccent[currentRole]}`}>
              <RoleIcon className="h-4 w-4" />
              {roleCopy[currentRole].title}
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <MetricCard label="Activos observados" value={overview.summary.monitoredAssets.toString()} hint="telemetría conectada" />
            <MetricCard label="Alertas activas" value={overview.summary.activeAlerts.toString()} hint="priorización viva" />
            <MetricCard label="Anomaly score" value={`${overview.summary.anomalyScore}%`} hint={roleCopy[currentRole].label} />
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
                <ShieldCheck className="h-3.5 w-3.5" />
                Session active
              </div>
            </div>

            <div className="grid min-w-0 gap-3 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="min-w-0 rounded-3xl border border-white/10 bg-neutral-950/90 p-4 sm:p-5">
                <p className="text-sm font-medium text-white/85">Sesión actual</p>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  El dashboard muestra una vista distinta según el rol activo. Puedes alternar perfiles en esta demo para validar la experiencia completa.
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                    {session.user.email}
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-white/45">
                    {session.user.displayName}
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/50">Capacidades por rol</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['admin', 'analyst', 'operator'] as const).map((role) => (
                      <RoleChip key={role} active={currentRole === role} onClick={() => setSelectedRole(role)}>
                        {roleCopy[role].label}
                      </RoleChip>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {overview.widgets.map((widget) => (
                      <div key={widget} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/72">
                        {widget}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="min-w-0 rounded-3xl border border-white/10 bg-neutral-950/90 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-white/50">Dashboard</p>
                    <h2 className="text-xl font-semibold">Vista operativa</h2>
                  </div>
                  <div className="shrink-0 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                    {overview.summary.activeAlerts} alertas activas
                  </div>
                </div>

                <div className="mt-5 grid gap-3 2xl:grid-cols-2">
                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between text-sm text-white/55">
                      <span>{overview.alerts[0]?.asset ?? 'Activo principal'}</span>
                      <span className="text-rose-300">{overview.trends[0]?.status === 'anomaly' ? 'Anomalía detectada' : 'Deriva detectada'}</span>
                    </div>
                    <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(34,211,238,0.01))] p-3">
                      <div className="flex h-full items-end gap-2">
                        {(overview.trends[0]?.values ?? [35, 42, 44, 47, 49, 52, 60, 71]).map((value, index) => (
                          <div key={index} className="flex-1 rounded-t-xl bg-cyan-300/70" style={{ height: `${value}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-white/55">{mailExperience.title}</p>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/70">
                        {currentRole === 'operator' ? 'solo interno' : 'cliente + interno'}
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {overview.mailbox.slice(0, 3).map((message) => (
                        <div key={message.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm text-white/70">{message.fromName}</p>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] ${
                                message.scope === 'client'
                                  ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                                  : 'border-white/10 bg-white/5 text-white/75'
                              }`}
                            >
                              {message.scope === 'client' ? 'cliente' : 'interno'}
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium text-white/88">{message.subject}</p>
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

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/15">
            <AlertTriangle className="h-5 w-5 text-cyan-300" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">Alertas activas</h3>
          <div className="mt-4 space-y-3">
            {overview.alerts.map((alert) => (
              <div key={alert.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/55">{alert.asset}</p>
                  <span className="text-xs uppercase tracking-[0.14em] text-cyan-200">{alert.severity}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-white/88">{alert.title}</p>
                <p className="mt-1 text-sm text-white/62">{alert.deviation}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/15">
            <LineChart className="h-5 w-5 text-cyan-300" />
          </div>
          <h3 className="mt-5 text-xl font-semibold">Tendencias y deriva</h3>
          <div className="mt-4 space-y-4">
            {overview.trends.map((trend) => (
              <article key={trend.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-white/55">{trend.label}</p>
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] text-cyan-200">
                    {trend.status}
                  </span>
                </div>
                <div className="mt-4 h-24 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(34,211,238,0.01))] p-3">
                  <div className="flex h-full items-end gap-2">
                    {trend.values.map((value, index) => (
                      <div key={`${trend.label}-${index}`} className="flex-1 rounded-t-xl bg-cyan-300/70" style={{ height: `${value}%` }} />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/15">
            <Mail className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{mailExperience.title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">{mailExperience.helper}</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              {mailExperience.composeLabel}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {mailExperience.folders.map((folder) => (
              <span key={folder} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-white/70">
                {folder}
              </span>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {overview.mailbox.map((message) => (
              <article key={message.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <Bell className="h-4 w-4 text-cyan-300" />
                    </div>
                    <div>
                      <p className="text-sm text-white/55">
                        {message.fromName} <span className="text-white/35">&lt;{message.fromEmail}&gt;</span>
                      </p>
                      <p className="mt-1 text-base font-semibold text-white/92">{message.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/45">{message.receivedAt}</p>
                    {message.unread ? (
                      <span className="mt-2 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[11px] text-emerald-100">
                        unread
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/70">
                    {message.folder}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      message.scope === 'client'
                        ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100'
                        : 'border-white/10 bg-white/5 text-white/75'
                    }`}
                  >
                    {message.scope === 'client' ? 'cliente' : 'interno'}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] ${mailTagTone[message.tag]}`}>{message.tag}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">{message.preview}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}
