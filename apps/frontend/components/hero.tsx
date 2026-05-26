import Link from 'next/link';
import { ArrowRight, ShieldAlert, TrendingUp, Clock } from 'lucide-react';

const pillars = [
  {
    icon: ShieldAlert,
    label: 'Alertas antes del fallo',
    desc: 'El sistema avisa cuando un dato se acerca al límite crítico, no cuando ya lo ha cruzado.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
  },
  {
    icon: TrendingUp,
    label: 'Detección de deriva',
    desc: 'Identifica tendencias progresivas en el proceso antes de que se conviertan en incidencias.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
  },
  {
    icon: Clock,
    label: 'Patrones temporales',
    desc: 'Detecta si las anomalías se concentran en franjas horarias concretas e indica causas externas recurrentes.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
];

export function Hero() {
  return (
    <section className="mx-auto max-w-none px-4 pt-20 pb-16 sm:px-6 lg:pt-28 lg:pb-20">
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm font-medium text-cyan-700">
          Observabilidad industrial · Detección de anomalías
        </span>

        <h1 className="mt-7 text-5xl font-semibold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
          Detecta el fallo<br />
          <span className="text-cyan-600">antes de que ocurra.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-xl leading-8 text-slate-400 italic">
          "El algoritmo aprende del silencio, para detectar ruido."
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          AtalayaX analiza los datos de tus sensores industriales y detecta desviaciones, derivas
          y patrones anómalos antes de que se conviertan en paradas o fallos costosos.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 hover:scale-[1.02]"
          >
            Solicitar demo interactiva
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Acceder a la plataforma
          </Link>
        </div>
      </div>

      {/* Three pillars */}
      <div className="mx-auto mt-20 grid max-w-5xl gap-5 sm:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.label} className={`rounded-[2rem] border ${p.border} bg-white p-6 shadow-sm`}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${p.bg}`}>
              <p.icon className={`h-5 w-5 ${p.color}`} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">{p.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
