'use client';

import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronUp,
  Clock,
  FileDown,
  Loader2,
  TrendingDown,
  TrendingUp,
  Upload,
} from 'lucide-react';
import type {
  AnomalyEvent,
  AuthSessionDto,
  DemoRecord,
  DriftSegment,
  ResolutionLevel,
  SensorAnalysisResult,
  SensorParseResponseDto,
  TimePattern,
} from '@atalayax/types';
import { analyzeSensorData, uploadSensorFile } from '../lib/api';
import { getClient, saveDemo } from '../lib/demo-store';
import { openReport } from '../lib/report';

type Step = 'upload' | 'configure' | 'results';
type Cfg = { resolution: ResolutionLevel; warnLow: number; warnHigh: number; sensorCol: string; tsCol: string };

type SensorDemoShellProps = {
  session: AuthSessionDto;
  clientId: string;
  clientName: string;
  onSaved: (demoId: string) => void;
};

const anomalyMeta: Record<AnomalyEvent['type'], { label: string; color: string; trend: 'up' | 'down' }> = {
  above_warn:       { label: 'Por encima del límite',    color: 'text-rose-600 border-rose-200 bg-rose-50',       trend: 'up' },
  below_warn:       { label: 'Por debajo del límite',    color: 'text-amber-600 border-amber-200 bg-amber-50',    trend: 'down' },
  approaching_high: { label: 'Tendencia al límite alto', color: 'text-orange-600 border-orange-200 bg-orange-50', trend: 'up' },
  approaching_low:  { label: 'Tendencia al límite bajo', color: 'text-yellow-600 border-yellow-200 bg-yellow-50', trend: 'down' },
  statistical_high: { label: 'Pico estadístico alto',    color: 'text-fuchsia-600 border-fuchsia-200 bg-fuchsia-50', trend: 'up' },
  statistical_low:  { label: 'Pico estadístico bajo',    color: 'text-violet-600 border-violet-200 bg-violet-50',  trend: 'down' },
  drift_up:         { label: 'Deriva progresiva al alza', color: 'text-orange-600 border-orange-200 bg-orange-50', trend: 'up' },
  drift_down:       { label: 'Deriva progresiva a la baja', color: 'text-sky-600 border-sky-200 bg-sky-50',       trend: 'down' },
};

const resolutionConfig: Record<ResolutionLevel, { label: string; hint: string }> = {
  1: { label: 'General',     hint: 'Solo detecta anomalías grandes y claras' },
  2: { label: 'Equilibrado', hint: 'Equilibrio entre señal y ruido — recomendado' },
  3: { label: 'Fino',        hint: 'Capta cualquier variación, por pequeña que sea' },
};

function round2(n: number) { return Math.round(n * 100) / 100; }
function pad2(n: number) { return String(n).padStart(2, '0'); }

// ─── Step 1: Upload ──────────────────────────────────────────────────────────

function UploadStep({ token, onParsed, setFileName }: {
  token: string;
  onParsed: (r: SensorParseResponseDto) => void;
  setFileName: (n: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setLoading(true);
    setFileName(file.name);
    try {
      onParsed(await uploadSensorFile(file, token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Sube el archivo de datos</h2>
      <p className="mt-2 text-zinc-500">Acepta <span className="font-medium text-cyan-600">.xlsx · .xls · .csv</span> de hasta 10 MB.</p>
      <button type="button" disabled={loading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void handleFile(f); }}
        className={`mt-6 flex w-full flex-col items-center justify-center gap-5 rounded-[2rem] border-2 border-dashed px-8 py-14 transition
          ${dragging ? 'border-cyan-400 bg-cyan-50' : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-white'}
          ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
        {loading ? (
          <><Loader2 className="h-9 w-9 animate-spin text-cyan-600" /><p className="text-zinc-500">Procesando…</p></>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 ring-1 ring-cyan-200">
              <Upload className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="text-center">
              <p className="font-medium text-zinc-700">Arrastra el archivo aquí o haz clic para seleccionar</p>
              <p className="mt-1 text-sm text-zinc-400">.xlsx · .xls · .csv · máx 10 MB</p>
            </div>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Configure ───────────────────────────────────────────────────────

function ConfigureStep({ parsed, token, onBack, onAnalyze }: {
  parsed: SensorParseResponseDto;
  token: string;
  onBack: () => void;
  onAnalyze: (r: SensorAnalysisResult, cfg: Cfg) => void;
}) {
  const tsCols = parsed.columns.filter((c) => c.type === 'timestamp');
  const numCols = parsed.columns.filter((c) => c.type === 'numeric');

  const [tsCol, setTsCol] = useState(tsCols[0]?.name ?? parsed.columns[0]?.name ?? '');
  const [sensorCol, setSensorCol] = useState(numCols[0]?.name ?? parsed.columns[1]?.name ?? '');
  const [resolution, setResolution] = useState<ResolutionLevel>(2);
  const [warnLow, setWarnLow] = useState('');
  const [warnHigh, setWarnHigh] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const low = parseFloat(warnLow);
    const high = parseFloat(warnHigh);
    if (isNaN(low) || isNaN(high)) { setError('Introduce los umbrales del proceso.'); return; }
    if (low >= high) { setError('El límite inferior debe ser menor que el superior.'); return; }
    setLoading(true);
    try {
      const result = await analyzeSensorData(
        { fileId: parsed.fileId, timestampColumn: tsCol, sensorColumn: sensorCol, resolution, warnLow: low, warnHigh: high },
        token,
      );
      onAnalyze(result, { resolution, warnLow: low, warnHigh: high, sensorCol, tsCol });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en el análisis');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Configura el análisis</h2>
          <p className="mt-1 text-zinc-500">
            <span className="font-medium text-cyan-600">{parsed.rowCount.toLocaleString()} filas</span> · {parsed.columns.length} columnas
          </p>
        </div>
        <button type="button" onClick={onBack} className="shrink-0 rounded-2xl border border-zinc-200 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50">
          ← Cambiar archivo
        </button>
      </div>

      {/* Preview */}
      <div className="mb-5 overflow-x-auto rounded-2xl border border-zinc-200 bg-white text-sm shadow-sm">
        <table className="w-full">
          <thead><tr className="border-b border-zinc-200 bg-zinc-50">{parsed.columns.map((c) => (
            <th key={c.name} className="px-4 py-2.5 text-left font-medium text-zinc-500">
              <span className="flex items-center gap-1.5">{c.name}
                <span className={`rounded-full border px-1.5 py-px text-[10px] ${c.type === 'timestamp' ? 'border-cyan-200 text-cyan-600' : c.type === 'numeric' ? 'border-emerald-200 text-emerald-600' : 'border-zinc-200 text-zinc-400'}`}>{c.type}</span>
              </span>
            </th>
          ))}</tr></thead>
          <tbody>{parsed.preview.map((row, i) => (
            <tr key={i} className="border-b border-zinc-100 last:border-0">
              {parsed.columns.map((c) => <td key={c.name} className="px-4 py-2 text-zinc-600">{row[c.name] ?? '—'}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {/* Columns */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-500">Columna de timestamp</label>
            <select value={tsCol} onChange={(e) => setTsCol(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-cyan-400 focus:outline-none">
              {parsed.columns.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-zinc-500">Columna de sensor</label>
            <select value={sensorCol} onChange={(e) => setSensorCol(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-cyan-400 focus:outline-none">
              {parsed.columns.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>)}
            </select>
          </div>
        </div>

        {/* Thresholds */}
        <div className="rounded-[1.5rem] border border-cyan-200 bg-cyan-50 p-5">
          <p className="mb-1 text-sm font-medium text-zinc-800">Rango aceptable del proceso</p>
          <p className="mb-4 text-xs text-zinc-500">
            Define qué valores son normales para este sensor. El sistema avisará antes de que se alcancen estos límites.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm text-zinc-500">Límite inferior</label>
              <input type="number" step="any" value={warnLow} onChange={(e) => setWarnLow(e.target.value)}
                placeholder="ej. -22" required
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-300 focus:border-cyan-400 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm text-zinc-500">Límite superior</label>
              <input type="number" step="any" value={warnHigh} onChange={(e) => setWarnHigh(e.target.value)}
                placeholder="ej. -15" required
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-300 focus:border-cyan-400 focus:outline-none" />
            </div>
          </div>
        </div>

        {/* Resolution */}
        <div className="rounded-[1.5rem] border border-zinc-200 bg-zinc-50 p-5">
          <p className="mb-1 text-sm font-medium text-zinc-800">Resolución de detección estadística</p>
          <p className="mb-4 text-xs text-zinc-500">Además de los límites, el sistema detecta anomalías estadísticas. Ajusta la sensibilidad.</p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as ResolutionLevel[]).map((r) => (
              <button key={r} type="button" onClick={() => setResolution(r)}
                className={`rounded-2xl border p-3 text-left transition ${resolution === r ? 'border-cyan-400 bg-white text-zinc-800 shadow-sm' : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50'}`}>
                <p className="font-semibold">{resolutionConfig[r].label}</p>
                <p className="mt-1 text-xs leading-5 text-zinc-400">{resolutionConfig[r].hint}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <button type="submit" disabled={loading || !tsCol || !sensorCol}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-700 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? 'Analizando…' : 'Analizar datos'}
        </button>
      </form>
    </div>
  );
}

// ─── Step 3: Results ─────────────────────────────────────────────────────────

function DriftSection({ segments }: { segments: DriftSegment[] }) {
  if (segments.length === 0) return null;
  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-orange-500" />
        <p className="text-sm font-medium text-zinc-700">{segments.length} tramo{segments.length > 1 ? 's' : ''} de deriva detectado{segments.length > 1 ? 's' : ''}</p>
      </div>
      <div className="space-y-3">
        {segments.map((seg, i) => (
          <div key={i} className={`rounded-2xl border p-4 ${seg.direction === 'up' ? 'border-orange-200 bg-orange-50' : 'border-sky-200 bg-sky-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {seg.direction === 'up'
                  ? <TrendingUp className="h-4 w-4 text-orange-500" />
                  : <TrendingDown className="h-4 w-4 text-sky-500" />}
                <span className={`text-sm font-medium ${seg.direction === 'up' ? 'text-orange-700' : 'text-sky-700'}`}>
                  Deriva {seg.direction === 'up' ? 'al alza' : 'a la baja'} — {seg.blockCount} bloques consecutivos
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold text-zinc-600">
                {seg.direction === 'up' ? '+' : '-'}{round2(seg.totalDrift)}
              </span>
            </div>
            <div className="mt-2 flex gap-4 text-xs text-zinc-400">
              <span>De {round2(seg.startMean)} → {round2(seg.endMean)}</span>
              <span className="truncate">{seg.startTimestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimePatternsSection({ patterns }: { patterns: TimePattern[] }) {
  if (patterns.length === 0) return null;
  const maxSig = Math.max(...patterns.map((p) => p.significance));

  return (
    <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
      <div className="mb-2 flex items-center gap-2">
        <Clock className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-medium text-amber-800">Patrones temporales detectados</p>
      </div>
      <p className="mb-5 text-xs text-zinc-500">
        Estas franjas horarias concentran más anomalías de lo esperado. Puede indicar una causa externa recurrente.
      </p>
      <div className="space-y-3">
        {patterns.map((p) => (
          <div key={p.hour} className="flex items-center gap-4">
            <span className="w-16 shrink-0 text-right text-sm font-mono text-zinc-600">
              {pad2(p.hour)}:00 – {pad2((p.hour + 1) % 24)}:00
            </span>
            <div className="relative flex-1 rounded-full bg-amber-100 h-6 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-amber-400/70"
                style={{ width: `${(p.significance / maxSig) * 100}%` }}
              />
              <span className="absolute inset-0 flex items-center px-3 text-xs text-amber-900">
                {p.anomalyCount} anomalías · {p.significance.toFixed(1)}× la media
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-400">
        Compara estos horarios con turnos, pausas o procesos externos que puedan influir en el sensor.
      </p>
    </div>
  );
}

// ─── Shared results content ───────────────────────────────────────────────────

function ResultsContent({ result, cfg }: { result: SensorAnalysisResult; cfg: Cfg }) {
  const [showAll, setShowAll] = useState(false);

  const criticalCount = result.anomalies.filter(
    (a) => a.type === 'above_warn' || a.type === 'below_warn' || a.type === 'statistical_high' || a.type === 'statistical_low',
  ).length;

  const displayed = showAll ? result.anomalies : result.anomalies.slice(0, 8);

  const maxMean = Math.max(...result.compressedBlocks.map((b) => b.mean), cfg.warnHigh * 1.05);
  const minMean = Math.min(...result.compressedBlocks.map((b) => b.mean), cfg.warnLow < 0 ? cfg.warnLow * 1.05 : cfg.warnLow * 0.95);
  const chartRange = maxMean - minMean || 1;

  function barColor(mean: number) {
    if (mean > cfg.warnHigh || mean < cfg.warnLow) return 'bg-rose-400/80';
    const margin = (cfg.warnHigh - cfg.warnLow) * 0.15;
    if (mean > cfg.warnHigh - margin || mean < cfg.warnLow + margin) return 'bg-amber-400/70';
    return 'bg-cyan-500/60';
  }
  function barH(v: number) { return Math.max(4, ((v - minMean) / chartRange) * 100); }

  return (
    <div className="space-y-5">
      <p className="text-xs text-zinc-400">
        {cfg.sensorCol} · {result.totalPoints.toLocaleString()} puntos · Resolución {resolutionConfig[cfg.resolution].label} · Rango [{cfg.warnLow}, {cfg.warnHigh}]
      </p>

      {/* KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Puntos analizados', value: result.totalPoints.toLocaleString(), t: 'neutral' },
          { label: 'Anomalías críticas', value: String(criticalCount), t: criticalCount > 0 ? 'danger' : 'ok' },
          { label: 'Tramos de deriva', value: String(result.driftSegments.length), t: result.driftSegments.length > 0 ? 'warn' : 'ok' },
          { label: 'Patrones horarios', value: String(result.timePatterns.length), t: result.timePatterns.length > 0 ? 'warn' : 'ok' },
        ].map((k) => {
          const tc = { neutral: 'border-zinc-200 bg-zinc-50', danger: 'border-rose-200 bg-rose-50', warn: 'border-amber-200 bg-amber-50', ok: 'border-emerald-200 bg-emerald-50' }[k.t];
          const vc = { neutral: 'text-zinc-800', danger: 'text-rose-600', warn: 'text-amber-700', ok: 'text-emerald-700' }[k.t];
          return (
            <div key={k.label} className={`rounded-3xl border p-4 ${tc}`}>
              <p className="text-xs text-zinc-500">{k.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${vc}`}>{k.value}</p>
            </div>
          );
        })}
      </div>

      {/* Compressed chart */}
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
        <p className="mb-1 text-sm font-medium text-zinc-600">Vista comprimida — {result.compressedBlocks.length} bloques</p>
        <div className="mt-4 flex gap-2">
          {/* Y-axis labels */}
          <div className="relative shrink-0 w-9" style={{ height: 144 }}>
            <span className="absolute right-0 text-[10px] text-zinc-400 leading-none" style={{ bottom: '96%', transform: 'translateY(50%)' }}>{round2(maxMean)}</span>
            <span className="absolute right-0 text-[10px] text-rose-500 leading-none font-medium" style={{ bottom: `${barH(cfg.warnHigh)}%`, transform: 'translateY(50%)' }}>{cfg.warnHigh}</span>
            <span className="absolute right-0 text-[10px] text-amber-500 leading-none font-medium" style={{ bottom: `${barH(cfg.warnLow)}%`, transform: 'translateY(50%)' }}>{cfg.warnLow}</span>
            <span className="absolute right-0 text-[10px] text-zinc-400 leading-none" style={{ bottom: 0, transform: 'translateY(50%)' }}>{round2(minMean)}</span>
          </div>
          {/* Bars */}
          <div className="relative flex-1 rounded-2xl bg-zinc-50 p-3 overflow-hidden" style={{ height: 144 }}>
            <div className="pointer-events-none absolute right-3 left-3 border-t border-dashed border-rose-400/60" style={{ bottom: `${barH(cfg.warnHigh)}%` }} />
            <div className="pointer-events-none absolute right-3 left-3 border-t border-dashed border-amber-400/50" style={{ bottom: `${barH(cfg.warnLow)}%` }} />
            <div className="flex h-full items-end gap-px overflow-hidden">
              {result.compressedBlocks.map((b, i) => (
                <div key={i} title={`Bloque ${i + 1}: ${round2(b.mean)}`}
                  className={`flex-1 rounded-t-sm ${barColor(b.mean)}`}
                  style={{ height: `${barH(b.mean)}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-[11px] text-zinc-400 pl-11">
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-cyan-500/60" />Normal</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-amber-400/70" />Tendencia</span>
          <span><span className="mr-1 inline-block h-2 w-2 rounded-sm bg-rose-400/80" />Anomalía</span>
          <span className="ml-auto text-zinc-300">↑ {cfg.warnHigh} límite sup. · ↓ {cfg.warnLow} límite inf.</span>
        </div>
      </div>

      {/* Drift segments */}
      <DriftSection segments={result.driftSegments} />

      {/* Time patterns */}
      <TimePatternsSection patterns={result.timePatterns} />

      {/* Anomaly list */}
      {result.anomalies.length > 0 ? (
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-medium text-zinc-700">{result.anomalies.length} eventos detectados</p>
          <div className="space-y-2">
            {displayed.map((a, i) => {
              const meta = anomalyMeta[a.type];
              const Icon = meta.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${meta.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-px text-xs ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-zinc-400">fila {a.index + 1}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-zinc-800">Valor: {round2(a.value)}</p>
                    <p className="text-xs text-zinc-500">{a.timestamp}</p>
                    {a.comparedToMean !== null && (
                      <p className="text-xs text-zinc-400">Media referencia: {round2(a.comparedToMean)} · Desviación: {round2(a.deviation)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {result.anomalies.length > 8 && (
            <button type="button" onClick={() => setShowAll((v) => !v)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 py-2 text-sm text-zinc-500 hover:bg-zinc-50">
              {showAll ? <><ChevronUp className="h-4 w-4" /> Mostrar menos</> : <>Ver {result.anomalies.length - 8} eventos más</>}
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Sin anomalías detectadas dentro del rango configurado.
        </div>
      )}
    </div>
  );
}

function ResultsStep({ result, cfg, clientName, fileName, onReset, onSaved }: {
  result: SensorAnalysisResult;
  cfg: Cfg;
  clientName: string;
  fileName: string;
  onReset: () => void;
  onSaved: () => void;
}) {
  const [saved, setSaved] = useState(false);

  function handleDownload() {
    const tempRecord = {
      id: '', clientId: '', createdAt: new Date().toISOString(),
      fileName, sensorColumn: cfg.sensorCol, timestampColumn: cfg.tsCol,
      resolution: cfg.resolution, warnLow: cfg.warnLow, warnHigh: cfg.warnHigh,
      totalPoints: result.totalPoints, anomalyCount: result.anomalies.length,
      overallMean: result.overallMean, result,
    };
    openReport(tempRecord, clientName);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Resultados</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={handleDownload}
            className="inline-flex items-center gap-2 shrink-0 rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100">
            <FileDown className="h-4 w-4" /> Descargar informe
          </button>
          {!saved ? (
            <button type="button" onClick={() => { setSaved(true); onSaved(); }}
              className="shrink-0 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700">
              Guardar demo
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle className="h-4 w-4" /> Guardada</span>
          )}
          <button type="button" onClick={onReset} className="shrink-0 rounded-2xl border border-zinc-200 px-4 py-2 text-sm text-zinc-500 hover:bg-zinc-50">
            Nueva demo
          </button>
        </div>
      </div>
      <ResultsContent result={result} cfg={cfg} />
    </div>
  );
}

// ─── Exported view for saved demos ───────────────────────────────────────────

export function SavedDemoResultsView({ demo, onBack }: { demo: DemoRecord; onBack: () => void }) {
  const cfg: Cfg = {
    resolution: demo.resolution,
    warnLow: demo.warnLow,
    warnHigh: demo.warnHigh,
    sensorCol: demo.sensorColumn,
    tsCol: demo.timestampColumn,
  };
  const clientName = getClient(demo.clientId)?.name ?? '';

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button type="button" onClick={onBack} className="text-sm text-zinc-400 hover:text-zinc-700">
          ← Volver al cliente
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openReport(demo, clientName)}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
          >
            <FileDown className="h-4 w-4" /> Descargar informe
          </button>
          <div className="text-right">
            <p className="font-medium text-zinc-800 truncate max-w-xs">{demo.fileName}</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {new Date(demo.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-lg sm:p-8">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-zinc-900">Resultados guardados</h2>
        <ResultsContent result={demo.result} cfg={cfg} />
      </div>
    </div>
  );
}

// ─── Main Shell ──────────────────────────────────────────────────────────────

export function SensorDemoShell({ session, clientId, clientName, onSaved }: SensorDemoShellProps) {
  const [step, setStep] = useState<Step>('upload');
  const [parsed, setParsed] = useState<SensorParseResponseDto | null>(null);
  const [result, setResult] = useState<SensorAnalysisResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [cfg, setCfg] = useState<Cfg | null>(null);

  const stepLabels = [
    { key: 'upload' as Step, label: '1. Archivo' },
    { key: 'configure' as Step, label: '2. Configurar' },
    { key: 'results' as Step, label: '3. Resultados' },
  ];
  const stepIndex = stepLabels.findIndex((s) => s.key === step);

  function handleSaved() {
    if (!result || !cfg) return;
    const record = saveDemo({
      clientId,
      fileName,
      sensorColumn: cfg.sensorCol,
      timestampColumn: cfg.tsCol,
      resolution: cfg.resolution,
      warnLow: cfg.warnLow,
      warnHigh: cfg.warnHigh,
      totalPoints: result.totalPoints,
      anomalyCount: result.anomalies.length,
      overallMean: result.overallMean,
      result,
    });
    onSaved(record.id);
  }

  return (
    <div>
      <div className="mx-auto mb-8 max-w-5xl flex flex-wrap items-center justify-between gap-4">
        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-500">{clientName}</span>
        <div className="flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${i < stepIndex ? 'bg-emerald-100 text-emerald-600' : i === stepIndex ? 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-300' : 'bg-zinc-100 text-zinc-400'}`}>
                {i < stepIndex ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:block ${i === stepIndex ? 'text-zinc-600' : 'text-zinc-400'}`}>{s.label}</span>
              {i < stepLabels.length - 1 && <div className={`h-px w-5 ${i < stepIndex ? 'bg-emerald-200' : 'bg-zinc-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-xl sm:p-8">
          {step === 'upload' && (
            <UploadStep token={session.accessToken} setFileName={setFileName}
              onParsed={(p) => { setParsed(p); setStep('configure'); }} />
          )}
          {step === 'configure' && parsed && (
            <ConfigureStep parsed={parsed} token={session.accessToken} onBack={() => setStep('upload')}
              onAnalyze={(r, c) => { setResult(r); setCfg(c); setStep('results'); }} />
          )}
          {step === 'results' && result && cfg && (
            <ResultsStep result={result} cfg={cfg} clientName={clientName} fileName={fileName}
              onSaved={handleSaved}
              onReset={() => { setParsed(null); setResult(null); setCfg(null); setFileName(''); setStep('upload'); }} />
          )}
        </div>
      </div>
    </div>
  );
}
