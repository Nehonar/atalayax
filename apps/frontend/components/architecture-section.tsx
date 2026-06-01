import Link from 'next/link';
import { Activity, ArrowRight, BarChart3, Gauge, Layers } from 'lucide-react';

const capabilities = [
  {
    icon: Gauge,
    title: 'Umbrales de proceso',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    desc: 'Define el rango aceptable para cada sensor. El sistema avisa con antelación cuando un valor se acerca al límite, no solo cuando lo cruza.',
  },
  {
    icon: Activity,
    title: 'Detección estadística',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    desc: 'Sin necesidad de datos históricos, el algoritmo aprende el comportamiento normal del proceso en tiempo real y detecta cualquier desviación significativa.',
  },
  {
    icon: Layers,
    title: 'Deriva de proceso',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Identifica degradaciones graduales que un umbral simple nunca captaría. Si el proceso lleva bloques consecutivos empeorando, AtalayaX lo detecta.',
  },
  {
    icon: BarChart3,
    title: 'Patrones horarios',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Cruza las anomalías con la hora del día. Si los fallos se concentran a las 14:00 todos los días, hay una causa externa recurrente que investigar.',
  },
];

const benchmarkRows = [
  { label: '50.000 puntos',    atalayax: '< 10 ms',  bruteForce: '~ 2,7 s',       ratio: '270×' },
  { label: '500.000 puntos',   atalayax: '~ 97 ms',  bruteForce: '~ 274 s',       ratio: '2.800×' },
  { label: '5.000.000 puntos', atalayax: '~ 3 s',    bruteForce: 'sin respuesta', ratio: '∞' },
];

export function ArchitectureSection() {
  return (
    <div className="space-y-20">

      {/* Capabilities */}
      <section>
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm font-medium text-zinc-500 shadow-sm">
            Capacidades de detección
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Cuatro capas de observabilidad sobre cada sensor
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-500">
            No basta con un límite de alerta. AtalayaX combina cuatro técnicas complementarias
            para que ningún tipo de anomalía pase desapercibida.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap) => (
            <article key={cap.title} className={`rounded-2xl border ${cap.border} bg-white p-6 shadow-sm`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cap.bg}`}>
                <cap.icon className={`h-5 w-5 ${cap.color}`} />
              </div>
              <h3 className="mt-4 font-semibold text-zinc-800">{cap.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{cap.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Benchmark */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              Rendimiento
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
              Resultados en segundos,<br />sin infraestructura adicional.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-600">
              Sube un CSV con millones de lecturas y obtén el análisis completo antes de
              terminar el café. Sin servidores dedicados, sin configuración previa.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-zinc-400">
              Diseñado para operar en tiempo lineal y memoria constante, independientemente
              del volumen de datos históricos.
            </p>
          </div>

          <div className="min-w-0 lg:min-w-[420px]">
            <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Volumen</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-600">AtalayaX</th>
                    <th className="px-4 py-3 text-right font-medium text-zinc-400">Fuerza bruta</th>
                    <th className="px-4 py-3 text-right font-medium text-emerald-600">Mejora</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkRows.map((row, i) => (
                    <tr key={row.label} className={`border-b border-zinc-100 last:border-0 ${i % 2 !== 0 ? 'bg-zinc-50/70' : ''}`}>
                      <td className="px-4 py-3 text-zinc-700">{row.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-600">{row.atalayax}</td>
                      <td className="px-4 py-3 text-right text-zinc-400">{row.bruteForce}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-600">{row.ratio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-zinc-400">
              Medición sobre datos de sensor industrial con 1 lectura/min. Los tiempos varían según hardware.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="rounded-2xl border border-zinc-200 bg-white px-8 py-14 text-center shadow-sm">
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          ¿Listo para ver tus datos en acción?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-zinc-500">
          Sube un fichero con lecturas de cualquier sensor y obtén un análisis completo
          con detección de anomalías, deriva y patrones en segundos.
        </p>
        <Link
          href="/demo"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 hover:scale-[1.02]"
        >
          Probar la demo
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-sm text-zinc-400">Sin instalación. Tus datos no se almacenan.</p>
      </section>

      {/* Footer */}
      <div className="border-t border-zinc-200 pb-8 pt-8 text-center text-sm text-zinc-400">
        © 2025 AtalayaX · Industrial data intelligence
      </div>
    </div>
  );
}
