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

// Rising data: temperature drifting toward upper limit
const pts = [
  { x: 20,  y: 108 },
  { x: 70,  y: 104 },
  { x: 120, y: 100 },
  { x: 170, y: 95  },
  { x: 220, y: 89  },
  { x: 270, y: 81  },
  { x: 320, y: 71  },
  { x: 370, y: 60  }, // approaching limit — amber for AtalayaX
  { x: 420, y: 46  }, // breach — rose
  { x: 470, y: 38  },
];

const W = 520;
const H = 150;
const limitY  = 48;   // upper limit (dashed rose line)
const amberY  = 64;   // approaching zone starts here (15% margin)
const bandBot = 114;  // lower limit (dashed rose line)
const PL = 8;
const PR = 8;

type Seg = { x1: number; y1: number; x2: number; y2: number; color: string };

function buildSegs(colorFn: (y: number) => string): Seg[] {
  return pts.slice(0, -1).map((p, i) => ({
    x1: p.x, y1: p.y,
    x2: pts[i + 1].x, y2: pts[i + 1].y,
    color: colorFn(p.y),
  }));
}

function colorAtalaya(y: number) {
  if (y <= limitY) return '#f87171';
  if (y <= amberY) return '#fbbf24';
  return '#22d3ee';
}
function colorTraditional(y: number) {
  return y <= limitY ? '#f87171' : '#22d3ee';
}

const tradSegs = buildSegs(colorTraditional);
const ataSegs  = buildSegs(colorAtalaya);
const tradDetect = pts[8]; // first breach
const ataDetect  = pts[7]; // first amber (trend)

function ChartBase() {
  return (
    <>
      <rect x={PL} y={limitY} width={W - PL - PR} height={bandBot - limitY} fill="#06b6d415" />
      <line x1={PL} x2={W - PR} y1={limitY} y2={limitY} stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
      <line x1={PL} x2={W - PR} y1={bandBot} y2={bandBot} stroke="#f87171" strokeWidth="1.5" strokeDasharray="6 4" />
    </>
  );
}

function ComparisonChart() {
  return (
    <div className="mx-auto mt-14 max-w-4xl">
      <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-zinc-400">
        La diferencia en una imagen
      </p>

      <div className="grid gap-4 sm:grid-cols-2">

        {/* Traditional */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-0.5 text-sm font-semibold text-zinc-500">Alarmas tradicionales</p>
          <p className="mb-3 text-xs text-zinc-400">Detecta cuando ya cruzó el límite</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <ChartBase />
            {tradSegs.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
            ))}
            {/* Late detection: X at breach */}
            <line x1={tradDetect.x - 8} y1={tradDetect.y - 8}
                  x2={tradDetect.x + 8} y2={tradDetect.y + 8} stroke="#dc2626" strokeWidth="2.5" />
            <line x1={tradDetect.x + 8} y1={tradDetect.y - 8}
                  x2={tradDetect.x - 8} y2={tradDetect.y + 8} stroke="#dc2626" strokeWidth="2.5" />
            <text x={tradDetect.x} y={tradDetect.y - 14}
              textAnchor="middle" fontSize="10" fill="#dc2626" fontWeight="600">Ya es tarde</text>
          </svg>
          <div className="mt-2 flex gap-4 text-[11px] text-zinc-400">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />Normal</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-400" />Alarma</span>
          </div>
        </div>

        {/* AtalayaX */}
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/30 p-5 shadow-sm">
          <p className="mb-0.5 text-sm font-semibold text-cyan-700">AtalayaX</p>
          <p className="mb-3 text-xs text-zinc-500">Detecta la tendencia antes de llegar al límite</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
            <ChartBase />
            {ataSegs.map((s, i) => (
              <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
                stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
            ))}
            {/* Early detection: amber circle at trend */}
            <circle cx={ataDetect.x} cy={ataDetect.y} r="8" fill="#fbbf24" opacity="0.9" />
            <circle cx={ataDetect.x} cy={ataDetect.y} r="14" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
            <text x={ataDetect.x} y={ataDetect.y - 22}
              textAnchor="middle" fontSize="10" fill="#d97706" fontWeight="600">Aviso de tendencia</text>
          </svg>
          <div className="mt-2 flex gap-4 text-[11px] text-zinc-400">
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />Normal</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />Tendencia</span>
            <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-rose-400" />Alarma</span>
          </div>
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
        <p className="mt-3 text-sm text-zinc-400">
          Sin instalación · Tus datos no se almacenan · Detecta el fallo antes de que ocurra.
        </p>
      </div>

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
