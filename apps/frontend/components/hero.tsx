import Link from 'next/link';
import { ShieldAlert, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const pillars = [
  {
    icon: ShieldAlert,
    label: 'Alertas antes del fallo',
    desc: 'El sistema avisa cuando un dato se acerca al límite crítico, no cuando ya lo ha cruzado.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
  },
  {
    icon: TrendingUp,
    label: 'Detección de deriva',
    desc: 'Identifica tendencias progresivas en el proceso antes de que se conviertan en incidencias.',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  {
    icon: Clock,
    label: 'Patrones temporales',
    desc: 'Detecta si las anomalías se concentran en franjas horarias concretas e indica causas externas recurrentes.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
];

function ComparisonChart() {
  // Shared geometry
  const W = 300;
  const H = 150;
  const limitY = 45;
  const baseY = 125;
  const riseStartX = 70;
  const riseEndX = 270;
  // Line rises from (riseStartX, baseY) to (riseEndX, limitY - 20)
  // y at position x: baseY - ((x - riseStartX) / (riseEndX - riseStartX)) * (baseY - (limitY - 20))
  const rise = baseY - (limitY - 20);
  function lineY(x: number) {
    if (x <= riseStartX) return baseY;
    if (x >= riseEndX) return limitY - 20;
    return baseY - ((x - riseStartX) / (riseEndX - riseStartX)) * rise;
  }
  // Traditional: detects where line crosses limitY
  const tradX = riseStartX + ((baseY - limitY) / rise) * (riseEndX - riseStartX);
  // AtalayaX: detects earlier, about 40% into the rise
  const earlyX = riseStartX + 0.38 * (riseEndX - riseStartX);
  const earlyY = lineY(earlyX);

  const linePath = `M 10,${baseY} L ${riseStartX},${baseY} L ${riseEndX},${limitY - 20}`;

  return (
    <div className="mx-auto mt-14 max-w-4xl">
      <p className="mb-6 text-center text-sm font-medium text-zinc-400 uppercase tracking-widest">La diferencia en una imagen</p>
      <div className="grid gap-4 sm:grid-cols-2">

        {/* Traditional */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-zinc-500">Alarmas tradicionales</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            {/* limit line */}
            <line x1="10" x2={W - 10} y1={limitY} y2={limitY}
              stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x={W - 12} y={limitY - 5} textAnchor="end" fontSize="10" fill="#f87171">límite</text>
            {/* sensor line */}
            <path d={linePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* detection: X at limit crossing */}
            <line x1={tradX - 7} y1={limitY - 7} x2={tradX + 7} y2={limitY + 7} stroke="#dc2626" strokeWidth="2.5" />
            <line x1={tradX + 7} y1={limitY - 7} x2={tradX - 7} y2={limitY + 7} stroke="#dc2626" strokeWidth="2.5" />
            <text x={tradX} y={limitY + 22} textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="600">Detectado aquí</text>
            {/* arrow */}
            <text x={tradX} y={H - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">cuando ya cruzó el límite</text>
          </svg>
        </div>

        {/* AtalayaX */}
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-cyan-700">AtalayaX</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            {/* limit line */}
            <line x1="10" x2={W - 10} y1={limitY} y2={limitY}
              stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
            <text x={W - 12} y={limitY - 5} textAnchor="end" fontSize="10" fill="#f87171">límite</text>
            {/* sensor line */}
            <path d={linePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* detection: circle earlier in rise */}
            <circle cx={earlyX} cy={earlyY} r="7" fill="#06b6d4" opacity="0.9" />
            <circle cx={earlyX} cy={earlyY} r="12" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" />
            <text x={earlyX} y={earlyY + 24} textAnchor="middle" fontSize="10" fill="#0891b2" fontWeight="600">Detectado aquí</text>
            {/* distance annotation */}
            <line x1={earlyX + 14} y1={earlyY} x2={tradX - 6} y2={limitY}
              stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <text x={tradX} y={H - 8} textAnchor="middle" fontSize="9" fill="#0891b2">horas antes de cruzar el límite</text>
          </svg>
        </div>

      </div>
      <p className="mt-5 text-center text-base text-zinc-500">
        <span className="font-semibold text-zinc-700">Las alarmas detectan límites.</span>
        {' '}AtalayaX detecta tendencias.
      </p>
    </div>
  );
}

export function Hero() {
  return (
    <section className="mx-auto max-w-none px-4 pt-20 pb-16 sm:px-6 lg:pt-28 lg:pb-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex rounded-full border border-cyan-200 bg-white px-4 py-1.5 text-sm font-medium text-cyan-700 shadow-sm">
          Detección temprana de deriva operacional
        </span>

        <h1 className="mt-7 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl">
          Tus alarmas detectan el fallo.<br />
          <span className="text-cyan-600">AtalayaX detecta que te estás acercando.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
          Analiza datos históricos o en tiempo real para identificar derivas, inestabilidades
          y cambios de comportamiento antes de que aparezcan las alarmas.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 hover:scale-[1.02]"
          >
            Analizar un CSV <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-7 py-3.5 text-base font-medium text-zinc-600 shadow-sm transition hover:bg-zinc-50"
          >
            Ver informe de ejemplo
          </Link>
        </div>
        <p className="mt-3 text-sm text-zinc-400">Sin instalación · Tus datos no se almacenan · Detecta el fallo antes de que ocurra.</p>
      </div>

      {/* Comparative chart */}
      <ComparisonChart />

      {/* Three pillars */}
      <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.label} className={`rounded-2xl border ${p.border} bg-white p-6 shadow-sm`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${p.bg}`}>
              <p.icon className={`h-5 w-5 ${p.color}`} />
            </div>
            <h3 className="mt-4 font-semibold text-zinc-800">{p.label}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
