import { Database, Eye, Mail, ServerCog } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: 'Frontend',
    stack: 'React / Next.js',
    text: 'Next.js con componentes reutilizables, cliente API tipado y separación entre UI, servicios y tipos.',
  },
  {
    icon: ServerCog,
    title: 'Backend API',
    stack: 'Fastify modular',
    text: 'Auth, RBAC, validación, trazabilidad, lógica de negocio y API segura para el dashboard.',
  },
  {
    icon: Mail,
    title: 'Servicio de correo',
    stack: 'SMTP / Mailpit / Mailu',
    text: 'Servicio independiente para SMTP/IMAP, integrado con la plataforma pero aislado del core de negocio.',
  },
  {
    icon: Database,
    title: 'Persistencia',
    stack: 'PostgreSQL',
    text: 'Usuarios, roles, alertas, histórico de eventos, trazabilidad y evolución futura del histórico industrial.',
  },
];

export function ArchitectureSection() {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10">
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
        {sections.map((section) => (
          <article key={section.title} className="rounded-[1.75rem] border border-white/10 bg-neutral-950/70 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5">
              <section.icon className="h-5 w-5 text-cyan-300" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{section.title}</h3>
            <p className="mt-1 text-sm text-cyan-200/75">{section.stack}</p>
            <p className="mt-4 text-sm leading-6 text-white/60">{section.text}</p>
          </article>
        ))}
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
    </section>
  );
}
