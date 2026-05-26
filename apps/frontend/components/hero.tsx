import Link from 'next/link';
import { ArrowRight, ShieldAlert, TrendingUp, Clock } from 'lucide-react';

const pillars = [
  {
    icon: ShieldAlert,
    label: 'Alertas antes del fallo',
    desc: 'El sistema avisa cuando un dato se acerca al límite crítico, no cuando ya lo ha cruzado.',
  },
  {
    icon: TrendingUp,
    label: 'Detección de deriva',
    desc: 'Identifica tendencias progresivas en el proceso antes de que se conviertan en incidencias.',
  },
  {
    icon: Clock,
    label: 'Patrones temporales',
    desc: 'Detecta si las anomalías se concentran en franjas horarias concretas e indica causas externas recurrentes.',
  },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-none px-4 py-20 sm:px-6 lg:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
          Observabilidad industrial · Detección de anomalías
        </span>

        <h1 className="mt-7 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          Detecta el fallo<br />
          <span className="text-cyan-300">antes de que ocurra.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-xl leading-8 text-white/60 italic">
          "El algoritmo aprende del silencio, para detectar ruido."
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/55">
          AtalayaX analiza los datos de tus sensores industriales y detecta desviaciones, derivas y patrones
          anómalos antes de que se conviertan en paradas o fallos costosos.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 font-semibold text-neutral-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02] hover:brightness-110"
          >
            Solicitar demo interactiva
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-3.5 font-medium text-white/80 transition hover:bg-white/5"
          >
            Acceder a la plataforma
          </Link>
        </div>
      </div>

      {/* Three pillars */}
      <div className="mx-auto mt-20 grid max-w-5xl gap-5 sm:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.label} className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
              <p.icon className="h-5 w-5 text-cyan-300" />
            </div>
            <h3 className="mt-4 font-semibold text-white/90">{p.label}</h3>
            <p className="mt-2 text-sm leading-6 text-white/50">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
