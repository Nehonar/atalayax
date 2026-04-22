import { useMemo, useState } from 'react';
import { ShieldCheck, Activity, Mail, Database, LineChart, Lock, ServerCog, Bell, ArrowRight, Eye, Cpu, Layers3 } from 'lucide-react';

const roles = {
  admin: {
    title: 'Administrador',
    widgets: ['Visión global', 'Alertas críticas', 'Usuarios y roles', 'Correo interno'],
  },
  analyst: {
    title: 'Analista',
    widgets: ['Tendencias', 'Desviaciones', 'Histórico XLS/CSV', 'Correo interno'],
  },
  operator: {
    title: 'Operador',
    widgets: ['Estado en tiempo real', 'Alertas activas', 'Resumen de máquina'],
  },
};

const features = [
  {
    icon: Activity,
    title: 'Observabilidad industrial',
    text: 'AtalayaX monitoriza señales de sensores en tiempo real y también analiza históricos importados desde XLS, CSV u otros formatos equivalentes.',
  },
  {
    icon: LineChart,
    title: 'Detección de deriva y desviaciones',
    text: 'Detecta trayectorias fuera de patrón, cambios de tendencia y posibles anomalías antes de que el proceso se salga de madre.',
  },
  {
    icon: Bell,
    title: 'Alertado temprano',
    text: 'Genera avisos accionables cuando una variable se desvía respecto a su comportamiento esperado o a sus bandas operativas.',
  },
  {
    icon: ShieldCheck,
    title: 'Acceso robusto',
    text: 'Autenticación endurecida, control por roles y credenciales protegidas en tránsito y en reposo con buenas prácticas de seguridad.',
  },
  {
    icon: Mail,
    title: 'Correo integrado propio',
    text: 'Módulo básico de envío y recepción de correo con infraestructura desacoplada sobre un servicio SMTP/IMAP propio desplegable con Docker Compose.',
  },
  {
    icon: Layers3,
    title: 'Arquitectura desacoplada',
    text: 'Frontend, backend y capa de correo completamente separados para facilitar escalabilidad, mantenimiento y despliegue.',
  },
];

const architecture = [
  {
    icon: Eye,
    title: 'Frontend',
    stack: 'React / Next.js',
    text: 'Interfaz de login, dashboard por roles, visualización de tendencias, alertas y buzón interno.',
  },
  {
    icon: ServerCog,
    title: 'Backend API',
    stack: 'NestJS / FastAPI',
    text: 'Auth, RBAC, ingestión de datos, análisis de series temporales, reglas de alertado y API del dashboard.',
  },
  {
    icon: Mail,
    title: 'Servicio de correo',
    stack: 'Mailu / Postal / Docker Compose',
    text: 'Servicio independiente para SMTP/IMAP, integrado con la plataforma pero aislado del core de negocio.',
  },
  {
    icon: Database,
    title: 'Persistencia',
    stack: 'PostgreSQL + almacenamiento histórico',
    text: 'Usuarios, roles, alertas, histórico de eventos, trazabilidad y metadatos de importaciones.',
  },
];

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-emerald-300/80">{hint}</p>
    </div>
  );
}

function RoleChip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
          : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

export default function WebDemo() {
  const [selectedRole, setSelectedRole] = useState('analyst');
  const currentRole = useMemo(() => roles[selectedRole], [selectedRole]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(to_bottom,#0a0a0a,#0a0a0a)]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">AtalayaX</p>
                <p className="text-sm text-white/45">Industrial data intelligence</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm text-white/60">
              <span className="rounded-full border border-white/10 px-4 py-2">Producto</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Seguridad</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Arquitectura</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Dashboard</span>
            </nav>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
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
              <button className="rounded-2xl bg-white px-5 py-3 font-medium text-neutral-900 shadow-lg shadow-white/10 transition hover:scale-[1.02]">
                Solicitar demo
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-medium text-white/80 transition hover:bg-white/5">
                Ver arquitectura
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <MetricCard label="Procesos observados" value="128" hint="+18% este trimestre" />
              <MetricCard label="Alertas preventivas" value="2.431" hint="desviaciones detectadas" />
              <MetricCard label="Tiempo de reacción" value="-37%" hint="antes del umbral crítico" />
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
                  <Lock className="h-3.5 w-3.5" />
                  Secure login enabled
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-3xl border border-white/10 bg-neutral-950/90 p-5">
                  <p className="text-sm font-medium text-white/85">Acceso seguro</p>
                  <p className="mt-2 text-sm leading-6 text-white/52">
                    Inicio de sesión robusto con separación clara entre interfaz, servicio de autenticación y gestión de sesiones por rol.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                      usuario@atalayax.io
                    </div>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-white/45">
                      ••••••••••••••••
                    </div>
                    <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                      Entrar al dashboard
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                    TLS, hash fuerte de contraseñas, sesiones seguras, RBAC y auditoría.
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-neutral-950/90 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/50">Dashboard</p>
                      <h2 className="text-xl font-semibold">Vista operativa</h2>
                    </div>
                    <div className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                      3 alertas activas
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/55">Buzón interno</p>
                      <div className="mt-4 space-y-3">
                        {[
                          'Alerta de vibración enviada al responsable de mantenimiento',
                          'Informe diario recibido desde planta norte',
                          'Incidencia de temperatura pendiente de revisión',
                        ].map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/70">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/50">Capacidades por rol</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(roles).map(([key, role]) => (
                        <RoleChip key={key} active={selectedRole === key} onClick={() => setSelectedRole(key)}>
                          {role.title}
                        </RoleChip>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {currentRole.widgets.map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/72">
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
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/15">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-white/65 leading-7">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
              Arquitectura propuesta
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Separación clara entre frontend, backend y correo.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/65">
              La plataforma debe construirse por dominios separados: interfaz de usuario, API de negocio y servicio de correo. Esto permite aplicar SOLID, DRY, despliegues independientes y responsabilidades bien delimitadas.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {architecture.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[1.75rem] border border-white/10 bg-neutral-950/70 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-cyan-200/75">{item.stack}</p>
                  <p className="mt-4 text-sm leading-6 text-white/60">{item.text}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-50/90">
              <strong>Frontend:</strong> sin lógica de negocio sensible, solo presentación, validación de formularios y consumo tipado de la API.
            </div>
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-7 text-cyan-50/90">
              <strong>Backend:</strong> autenticación, autorización, trazabilidad, analítica, reglas y exposición de endpoints seguros.
            </div>
            <div className="rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5 text-sm leading-7 text-fuchsia-50/90">
              <strong>SMTP:</strong> servicio aislado, con credenciales propias, colas y configuración independiente del core de producto.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Seguridad de autenticación</h2>
            </div>
            <div className="mt-6 space-y-4 text-white/68">
              <p>
                La contraseña no debe “verse” en el backend como texto utilizable en ningún momento posterior al login. Debe viajar siempre bajo TLS y almacenarse solo como hash fuerte con sal y parámetros modernos.
              </p>
              <p>
                Recomendación base: HTTPS obligatorio, cookies de sesión seguras o tokens bien gestionados, hash Argon2id o equivalente, rate limiting, rotación de sesiones, CSRF donde aplique y auditoría de accesos.
              </p>
              <p>
                El frontend, el backend y el servicio de correo deben tener secretos, despliegues y responsabilidades separados.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Cpu className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Buenas prácticas de implementación</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Arquitectura modular por dominio',
                'Principios SOLID',
                'DRY en servicios y componentes',
                'DTOs y contratos tipados',
                'Validación de entrada',
                'Logs y trazabilidad',
                'Tests unitarios e integración',
                'Docker Compose por entorno',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
