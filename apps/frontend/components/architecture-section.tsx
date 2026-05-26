import { Activity, BarChart3, Gauge, Layers } from 'lucide-react';

const capabilities = [
  {
    icon: Gauge,
    title: 'Umbrales de proceso',
    color: 'text-cyan-300',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/15',
    desc: 'Define el rango aceptable para cada sensor. El sistema avisa con antelación cuando un valor se acerca al límite, no solo cuando lo cruza.',
  },
  {
    icon: Activity,
    title: 'Detección estadística',
    color: 'text-fuchsia-300',
    bg: 'bg-fuchsia-400/10',
    border: 'border-fuchsia-400/15',
    desc: 'Sin necesidad de datos históricos, el algoritmo aprende el comportamiento normal del proceso en tiempo real y detecta cualquier desviación significativa.',
  },
  {
    icon: Layers,
    title: 'Deriva de proceso',
    color: 'text-orange-300',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/15',
    desc: 'Identifica degradaciones graduales que un umbral simple nunca captaría. Si el proceso lleva 4 o más bloques consecutivos empeorando, AtalayaX lo detecta.',
  },
  {
    icon: BarChart3,
    title: 'Patrones horarios',
    color: 'text-amber-300',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/15',
    desc: 'Cruza las anomalías con la hora del día. Si los fallos se concentran a las 14:00 todos los días, hay una causa externa recurrente que hay que investigar.',
  },
];

const benchmarkRows = [
  { label: '50.000 puntos',   atalayax: '< 10 ms',  bruteForce: '~ 2,7 s',    ratio: '270×' },
  { label: '500.000 puntos',  atalayax: '~ 97 ms',  bruteForce: '~ 274 s',    ratio: '2.800×' },
  { label: '5.000.000 puntos', atalayax: '~ 3 s',   bruteForce: 'sin respuesta', ratio: '∞' },
];

export function ArchitectureSection() {
  return (
    <div className="space-y-20">
      {/* Capabilities */}
      <section>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-white/60">
            Capacidades de detección
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Cuatro capas de observabilidad sobre cada sensor
          </h2>
          <p className="mt-4 text-lg leading-8 text-white/50">
            No basta con un límite de alerta. AtalayaX combina cuatro técnicas complementarias para que ningún tipo de anomalía pase desapercibida.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((cap) => (
            <article
              key={cap.title}
              className={`rounded-[2rem] border ${cap.border} bg-white/3 p-6`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${cap.bg}`}>
                <cap.icon className={`h-5 w-5 ${cap.color}`} />
              </div>
              <h3 className="mt-4 font-semibold text-white/90">{cap.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">{cap.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Benchmark */}
      <section className="rounded-[2rem] border border-white/10 bg-white/4 p-8 sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-sm text-emerald-200">
              Rendimiento
            </span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Resultados en milisegundos,<br />no en minutos.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/55">
              El algoritmo de compresión jerárquica de AtalayaX analiza conjuntos de millones de puntos en segundos, sin almacenar el histórico completo en memoria.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/40">
              A diferencia de los métodos de fuerza bruta —que comparan cada dato con todos los anteriores—, nuestro algoritmo opera en tiempo lineal y con huella de memoria constante.
            </p>
          </div>

          <div className="min-w-0 lg:min-w-[420px]">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-4 py-3 text-left font-medium text-white/45">Volumen</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">AtalayaX</th>
                    <th className="px-4 py-3 text-right font-medium text-white/35">Fuerza bruta</th>
                    <th className="px-4 py-3 text-right font-medium text-emerald-300">Mejora</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkRows.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-white/8 last:border-0 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/2'}`}
                    >
                      <td className="px-4 py-3 text-white/70">{row.label}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-300">{row.atalayax}</td>
                      <td className="px-4 py-3 text-right text-white/35">{row.bruteForce}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-300">{row.ratio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-white/30">
              Medición local sobre datos de sensor industrial con 1 lectura/min. Los tiempos varían según hardware.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
