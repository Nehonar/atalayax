import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Binary,
  Blocks,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Database,
  Eye,
  FileSpreadsheet,
  Gauge,
  Layers3,
  Lock,
  Mail,
  Radar,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  UserCog,
  Workflow,
} from 'lucide-react';

const roles = {
  admin: {
    title: 'Admin',
    summary: 'Gobierno global de la plataforma, usuarios, auditoría y alertas críticas.',
    widgets: ['Gestión de usuarios', 'RBAC y políticas', 'Alertas críticas', 'Buzón interno', 'Auditoría'],
  },
  analyst: {
    title: 'Analyst',
    summary: 'Análisis histórico, deriva, anomalías y explotación de datos importados.',
    widgets: ['Tendencias', 'Comparativas históricas', 'XLS/CSV import', 'Modelos de deriva', 'Correo interno'],
  },
  operator: {
    title: 'Operator',
    summary: 'Seguimiento operativo en tiempo real de máquinas, líneas y eventos activos.',
    widgets: ['Estado de máquina', 'Alertas activas', 'Variables críticas', 'Resumen de turno'],
  },
};

const productPillars = [
  {
    icon: Radar,
    title: 'Observabilidad industrial',
    text: 'Supervisión en tiempo real de sensores, estados de máquina y señales de proceso con contexto operativo.',
  },
  {
    icon: BrainCircuit,
    title: 'Detección de deriva',
    text: 'Identificación de cambios graduales de comportamiento antes de que el proceso cruce márgenes críticos.',
  },
  {
    icon: AlertTriangle,
    title: 'Desviaciones y anomalías',
    text: 'Detección de trayectorias fuera de patrón, outliers y rupturas de tendencia sobre series temporales.',
  },
  {
    icon: Bell,
    title: 'Alertado temprano',
    text: 'Notificaciones accionables orientadas a prevención, mantenimiento y reducción de incidencias.',
  },
];

const architecture = [
  {
    icon: Eye,
    title: 'Frontend',
    stack: 'React / Next.js + TypeScript',
    text: 'Landing, login, dashboard, vistas por rol, gráficos, alertas y buzón básico sin lógica sensible.',
  },
  {
    icon: Workflow,
    title: 'Backend API',
    stack: 'NestJS o FastAPI',
    text: 'Auth, RBAC, ingestión de datos, análisis, reglas de alertado, auditoría y contratos DTO/API.',
  },
  {
    icon: Mail,
    title: 'Servicio de correo',
    stack: 'Mailu / Postal',
    text: 'SMTP/IMAP desacoplado del core, con credenciales y despliegue independientes.',
  },
  {
    icon: Database,
    title: 'Persistencia',
    stack: 'PostgreSQL + almacenamiento histórico',
    text: 'Usuarios, sesiones, alertas, auditoría, metadatos de importación y series temporales indexadas.',
  },
];

const stackRecommendation = [
  {
    area: 'Frontend',
    choice: 'Next.js + TypeScript + Tailwind',
    reason: 'Buen equilibrio entre velocidad de desarrollo, escalabilidad, SSR y estructura de aplicación.',
  },
  {
    area: 'Backend',
    choice: 'NestJS',
    reason: 'Arquitectura modular fuerte, DI madura, RBAC cómodo y contrato limpio para APIs empresariales.',
  },
  {
    area: 'Base de datos',
    choice: 'PostgreSQL',
    reason: 'Fiable, versátil y adecuado para usuarios, auditoría, configuración y metadatos analíticos.',
  },
  {
    area: 'Correo',
    choice: 'Mailu',
    reason: 'Más simple de operar en Docker Compose para un buzón básico desacoplado del backend principal.',
  },
];

const securityLayers = [
  'HTTPS obligatorio en todo el tráfico',
  'Hash Argon2id con parámetros robustos y sal única',
  'Cookies HttpOnly/Secure/SameSite o sesión equivalente bien diseñada',
  'Rate limiting y bloqueo progresivo ante fuerza bruta',
  'CSRF cuando se use autenticación por cookie',
  'Rotación y expiración de sesión',
  'RBAC en backend y validación por recurso',
  'Auditoría de login, permisos y acciones críticas',
];

const authFlow = [
  {
    step: '1. Login',
    text: 'El usuario envía credenciales sobre TLS. El frontend nunca decide permisos, solo consume el resultado.',
  },
  {
    step: '2. Validación',
    text: 'El backend valida entrada, aplica rate limiting y compara hash Argon2id contra el almacén seguro.',
  },
  {
    step: '3. Sesión',
    text: 'Si el acceso es válido, se emite una sesión segura con expiración, rotación y contexto de rol.',
  },
  {
    step: '4. Autorización',
    text: 'Cada endpoint comprueba permisos RBAC y registra auditoría antes de devolver datos o permitir acciones.',
  },
];

const dashboardSections = [
  {
    icon: Gauge,
    title: 'KPIs operativos',
    text: 'Salud del parque, sensores monitorizados, líneas activas y latencia de observabilidad.',
  },
  {
    icon: Siren,
    title: 'Alertas activas',
    text: 'Desviaciones en curso, severidad, activo afectado y tiempo estimado hasta umbral crítico.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Tendencias y deriva',
    text: 'Visualización de series temporales, cambio de baseline y comparación contra comportamiento esperado.',
  },
  {
    icon: Mail,
    title: 'Buzón interno',
    text: 'Mensajería operativa básica con bandeja de entrada, avisos y seguimiento entre equipos.',
  },
];

const mailboxItems = [
  'Alerta de vibración enviada al responsable de mantenimiento',
  'Informe diario recibido desde planta norte',
  'Incidencia de temperatura pendiente de revisión',
];

const folderTree = [
  'apps/frontend',
  'apps/backend',
  'services/mail',
  'packages/ui',
  'packages/types',
  'packages/api-client',
  'infra/nginx',
  'infra/docker',
];

function SectionBadge({ children }) {
  return (
    <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
      {children}
    </span>
  );
}

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

function InfoCard({ icon: Icon, title, text, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/5',
    cyan: 'border-cyan-400/20 bg-cyan-400/10',
    emerald: 'border-emerald-400/20 bg-emerald-400/10',
    amber: 'border-amber-400/20 bg-amber-400/10',
  };

  return (
    <article className={`rounded-[1.75rem] border p-6 shadow-xl ${tones[tone]}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950/60 ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-cyan-300" />
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-white/68">{text}</p>
    </article>
  );
}

export default function WebDemo() {
  const [selectedRole, setSelectedRole] = useState('analyst');
  const currentRole = useMemo(() => roles[selectedRole], [selectedRole]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.2),transparent_34%),radial-gradient(circle_at_right,rgba(59,130,246,0.15),transparent_24%),linear-gradient(to_bottom,#09090b,#09090b)]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
                <Radar className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">AtalayaX</p>
                <p className="text-sm text-white/45">Industrial observability intelligence</p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm text-white/60">
              <span className="rounded-full border border-white/10 px-4 py-2">Producto</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Arquitectura</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Seguridad</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Dashboard</span>
              <span className="rounded-full border border-white/10 px-4 py-2">Correo</span>
            </nav>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        <div className="grid gap-14 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
          <div>
            <SectionBadge>Observabilidad industrial, deriva y alertado preventivo</SectionBadge>
            <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              AtalayaX vigila señales industriales, detecta patrones anómalos y anticipa el fallo antes de que ocurra.
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">
              Plataforma SaaS orientada a monitorización en tiempo real, análisis histórico desde XLS/CSV y detección de desviaciones de tendencia, deriva de proceso y anomalías sobre activos industriales. Diseñada con separación estricta entre frontend, backend y servicio de correo.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-2xl bg-white px-5 py-3 font-medium text-neutral-900 shadow-lg shadow-white/10 transition hover:scale-[1.02]">
                Solicitar arquitectura
              </button>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-medium text-white/80 transition hover:bg-white/5">
                Ver dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <MetricCard label="Sensores observados" value="18.240" hint="Streaming y batch unificados" />
              <MetricCard label="Alertas preventivas" value="2.431" hint="Antes del umbral crítico" />
              <MetricCard label="Tiempo de reacción" value="-37%" hint="Reducción media operativa" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-emerald-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  <Lock className="h-3.5 w-3.5" />
                  Zero clear-text passwords
                </div>
              </div>

              <div className="grid gap-4 2xl:grid-cols-[0.84fr_1.16fr]">
                <div className="rounded-3xl border border-white/10 bg-neutral-950/90 p-5">
                  <p className="text-sm font-medium text-white/85">Login seguro</p>
                  <p className="mt-2 text-sm leading-6 text-white/52">
                    Autenticación robusta con TLS obligatorio, backend con hash Argon2id y gestión de sesión endurecida.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/45">
                      analyst@atalayax.io
                    </div>
                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-white/45">
                      ••••••••••••••••
                    </div>
                    <button className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
                      Entrar al dashboard
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55">
                    RBAC, auditoría, rate limiting, expiración y rotación de sesión.
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-neutral-950/90 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/50">Dashboard</p>
                      <h2 className="text-xl font-semibold">Vista operativa</h2>
                    </div>
                    <div className="shrink-0 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs text-orange-200">
                      3 alertas activas
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 2xl:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm text-white/55">
                        <span>Motor línea 4</span>
                        <span className="text-rose-300">Deriva detectada</span>
                      </div>
                      <div className="mt-4 h-28 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.08),rgba(34,211,238,0.01))] p-3">
                        <div className="flex h-full items-end gap-2">
                          {[24, 28, 34, 39, 48, 56, 67, 78].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t-xl bg-cyan-300/70" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-white/55">Buzón interno</p>
                      <div className="mt-4 space-y-3">
                        {mailboxItems.map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/70">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/50">Vistas por rol</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(roles).map(([key, role]) => (
                        <RoleChip key={key} active={selectedRole === key} onClick={() => setSelectedRole(key)}>
                          {role.title}
                        </RoleChip>
                      ))}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/60">{currentRole.summary}</p>
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
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {productPillars.map((item) => (
            <InfoCard key={item.title} icon={item.icon} title={item.title} text={item.text} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10">
          <div className="max-w-3xl">
            <SectionBadge>Arquitectura técnica recomendada</SectionBadge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Separación real entre frontend, backend y correo.
            </h2>
            <p className="mt-4 text-lg leading-8 text-white/65">
              La recomendación base es una arquitectura desacoplada por servicios. El frontend no ejecuta lógica sensible, el backend concentra autenticación y negocio, y el correo opera como infraestructura independiente conectada por API y SMTP/IMAP.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {architecture.map((item) => (
              <article key={item.title} className="rounded-[1.75rem] border border-white/10 bg-neutral-950/70 p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
                  <item.icon className="h-5 w-5 text-cyan-300" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-cyan-200/75">{item.stack}</p>
                <p className="mt-4 text-sm leading-6 text-white/60">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm leading-7 text-emerald-50/90">
              <strong>Frontend:</strong> UI, routing, formularios, gráficos y cliente tipado de API. Sin secretos ni reglas de negocio críticas.
            </div>
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-sm leading-7 text-cyan-50/90">
              <strong>Backend:</strong> auth, RBAC, ingestión, análisis, alertas, auditoría y normalización de datos importados.
            </div>
            <div className="rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5 text-sm leading-7 text-fuchsia-50/90">
              <strong>Correo:</strong> servicio aislado con dominio, cuentas, IMAP/SMTP y políticas operadas fuera del core de producto.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Blocks className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Stack recomendado</h2>
            </div>
            <div className="mt-6 space-y-4">
              {stackRecommendation.map((item) => (
                <div key={item.area} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-white/50">{item.area}</p>
                    <p className="text-sm font-medium text-cyan-200">{item.choice}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/65">{item.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Binary className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Estructura de carpetas</h2>
            </div>
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-neutral-950/80 p-5">
              <p className="text-sm text-white/45">Monorepo orientado a dominios y despliegue separado</p>
              <div className="mt-4 space-y-3 font-mono text-sm text-white/78">
                {folderTree.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Flujo de autenticación seguro</h2>
            </div>
            <div className="mt-6 space-y-4">
              {authFlow.map((item) => (
                <div key={item.step} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-medium text-cyan-200">{item.step}</p>
                  <p className="mt-2 text-sm leading-6 text-white/68">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Lock className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Controles de seguridad</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {securityLayers.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Dashboard inicial</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {dashboardSections.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5">
                    <item.icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Integración del buzón</h2>
            </div>
            <div className="mt-6 space-y-4">
              <InfoCard
                icon={Mail}
                title="Servicio independiente"
                text="Mailu como servicio aislado en Docker Compose, con dominio interno, SMTP/IMAP y administración propia."
                tone="cyan"
              />
              <InfoCard
                icon={UserCog}
                title="Conexión con la plataforma"
                text="El backend sincroniza metadatos necesarios del buzón y expone un API interno para la vista de correo del dashboard."
                tone="emerald"
              />
              <InfoCard
                icon={FileSpreadsheet}
                title="Casos de uso iniciales"
                text="Alertas automáticas, envío de informes, recepción de incidencias y trazabilidad básica de comunicaciones operativas."
                tone="amber"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <Layers3 className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Buenas prácticas de arquitectura</h2>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                'Modularidad por dominio',
                'DTOs y contratos explícitos',
                'Servicios desacoplados',
                'Capas con responsabilidad única',
                'Validación a la entrada',
                'Cliente API tipado',
                'Observabilidad de backend',
                'Test unitario e integración',
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-cyan-300" />
              <h2 className="text-2xl font-semibold">Base de proyecto propuesta</h2>
            </div>
            <div className="mt-6 space-y-4 text-white/68">
              <p>
                Este primer demo ya deja definida la narrativa funcional y visual de AtalayaX: producto, separación técnica, seguridad, RBAC, dashboard y correo desacoplado.
              </p>
              <p>
                El siguiente paso razonable es extraer esta demo a un `frontend` real y acompañarla con un esqueleto de monorepo, `docker-compose.yml`, backend modular y contratos compartidos.
              </p>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50/90">
                Recomendación: usar esta pantalla como base de landing y blueprint inicial de producto mientras se crea la estructura real por servicios.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
