'use client';

import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronUp,
  Loader2,
  TrendingDown,
  TrendingUp,
  Upload,
} from 'lucide-react';
import type {
  AnomalyEvent,
  AuthSessionDto,
  ResolutionLevel,
  SensorAnalysisResult,
  SensorParseResponseDto,
} from '@atalayax/types';
import { analyzeSensorData, uploadSensorFile } from '../lib/api';
import { saveDemo } from '../lib/demo-store';

type Step = 'upload' | 'configure' | 'results';

type SensorDemoShellProps = {
  session: AuthSessionDto;
  clientId: string;
  clientName: string;
  onSaved: (demoId: string) => void;
};

const anomalyMeta: Record<AnomalyEvent['type'], { label: string; color: string; trend: 'up' | 'down' }> = {
  above_warn:      { label: 'Por encima del límite',    color: 'text-rose-300 border-rose-400/20 bg-rose-400/10',   trend: 'up' },
  below_warn:      { label: 'Por debajo del límite',    color: 'text-amber-300 border-amber-400/20 bg-amber-400/10', trend: 'down' },
  approaching_high:{ label: 'Tendencia al límite alto', color: 'text-orange-300 border-orange-400/20 bg-orange-400/10', trend: 'up' },
  approaching_low: { label: 'Tendencia al límite bajo', color: 'text-yellow-300 border-yellow-400/20 bg-yellow-400/10', trend: 'down' },
  statistical_high:{ label: 'Pico estadístico alto',    color: 'text-fuchsia-300 border-fuchsia-400/20 bg-fuchsia-400/10', trend: 'up' },
  statistical_low: { label: 'Pico estadístico bajo',    color: 'text-violet-300 border-violet-400/20 bg-violet-400/10', trend: 'down' },
};

const resolutionConfig: Record<ResolutionLevel, { label: string; hint: string }> = {
  1: { label: 'General',     hint: 'Solo detecta anomalías grandes y claras' },
  2: { label: 'Equilibrado', hint: 'Equilibrio entre señal y ruido — recomendado' },
  3: { label: 'Fino',        hint: 'Capta cualquier variación, por pequeña que sea' },
};

function round2(n: number) { return Math.round(n * 100) / 100; }

// ─── Step 1: Upload ──────────────────────────────────────────────────────────

function UploadStep({ token, onParsed, fileName, setFileName }: {
  token: string;
  onParsed: (r: SensorParseResponseDto) => void;
  fileName: string;
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
      const result = await uploadSensorFile(file, token);
      onParsed(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold tracking-tight">Sube el archivo de datos</h2>
      <p className="mt-2 text-white/55">Acepta <span className="text-cyan-300">.xlsx · .xls · .csv</span> de hasta 10 MB.</p>

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) void handleFile(f); }}
        className={`mt-6 flex w-full flex-col items-center justify-center gap-5 rounded-[2rem] border-2 border-dashed px-8 py-14 transition ${
          dragging ? 'border-cyan-400/60 bg-cyan-400/8' : 'border-white/15 bg-white/3 hover:border-white/25 hover:bg-white/5'
        } ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {loading ? (
          <><Loader2 className="h-9 w-9 animate-spin text-cyan-300" /><p className="text-white/60">Procesando…</p></>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/20">
              <Upload className="h-6 w-6 text-cyan-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-white/85">Arrastra el archivo aquí o haz clic para seleccionar</p>
              <p className="mt-1 text-sm text-white/40">.xlsx · .xls · .csv · máx 10 MB</p>
            </div>
          </>
        )}
      </button>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ''; }} />

      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
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
  onAnalyze: (r: SensorAnalysisResult, cfg: { resolution: ResolutionLevel; warnLow?: number; warnHigh?: number; sensorCol: string; tsCol: string }) => void;
}) {
  const tsCols = parsed.columns.filter((c) => c.type === 'timestamp');
  const numCols = parsed.columns.filter((c) => c.type === 'numeric');

  const [tsCol, setTsCol] = useState(tsCols[0]?.name ?? parsed.columns[0]?.name ?? '');
  const [sensorCol, setSensorCol] = useState(numCols[0]?.name ?? parsed.columns[1]?.name ?? '');
  const [resolution, setResolution] = useState<ResolutionLevel>(2);
  const [expertMode, setExpertMode] = useState(false);
  const [warnLow, setWarnLow] = useState('');
  const [warnHigh, setWarnHigh] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    let low: number | undefined;
    let high: number | undefined;

    if (expertMode) {
      low = parseFloat(warnLow);
      high = parseFloat(warnHigh);
      if (isNaN(low) || isNaN(high)) { setError('Introduce valores numéricos válidos para los umbrales.'); return; }
      if (low >= high) { setError('El límite inferior debe ser menor que el superior.'); return; }
    }

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
          <h2 className="text-2xl font-semibold tracking-tight">Configura el análisis</h2>
          <p className="mt-1 text-white/55">
            <span className="text-cyan-300">{parsed.rowCount.toLocaleString()} filas</span> · {parsed.columns.length} columnas
          </p>
        </div>
        <button type="button" onClick={onBack} className="shrink-0 rounded-2xl border border-white/10 px-3 py-2 text-sm text-white/50 hover:bg-white/5">
          ← Cambiar archivo
        </button>
      </div>

      {/* Preview */}
      <div className="mb-5 overflow-x-auto rounded-2xl border border-white/10 bg-white/3 text-sm">
        <table className="w-full">
          <thead><tr className="border-b border-white/10">{parsed.columns.map((c) => (
            <th key={c.name} className="px-4 py-2.5 text-left font-medium text-white/45">
              <span className="flex items-center gap-1.5">{c.name}
                <span className={`rounded-full border px-1.5 py-px text-[10px] ${c.type === 'timestamp' ? 'border-cyan-400/20 text-cyan-300' : c.type === 'numeric' ? 'border-emerald-400/20 text-emerald-300' : 'border-white/10 text-white/40'}`}>{c.type}</span>
              </span>
            </th>
          ))}</tr></thead>
          <tbody>{parsed.preview.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              {parsed.columns.map((c) => <td key={c.name} className="px-4 py-2 text-white/60">{row[c.name] ?? '—'}</td>)}
            </tr>
          ))}</tbody>
        </table>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm text-white/50">Columna de timestamp</label>
            <select value={tsCol} onChange={(e) => setTsCol(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-cyan-400/40 focus:outline-none">
              {parsed.columns.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm text-white/50">Columna de sensor</label>
            <select value={sensorCol} onChange={(e) => setSensorCol(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-cyan-400/40 focus:outline-none">
              {parsed.columns.map((c) => <option key={c.name} value={c.name}>{c.name} ({c.type})</option>)}
            </select>
          </div>
        </div>

        {/* Resolución */}
        <div className="rounded-[1.5rem] border border-white/10 bg-white/3 p-5">
          <p className="mb-1 text-sm font-medium text-white/80">Resolución de detección</p>
          <p className="mb-4 text-xs text-white/40">Cuánto afinas el análisis. A más resolución, más pequeñas son las anomalías que detecta.</p>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as ResolutionLevel[]).map((r) => (
              <button key={r} type="button" onClick={() => setResolution(r)}
                className={`rounded-2xl border p-3 text-left transition ${resolution === r ? 'border-cyan-400/40 bg-cyan-400/12 text-white' : 'border-white/10 bg-white/3 text-white/50 hover:bg-white/6'}`}>
                <p className="font-semibold">{resolutionConfig[r].label}</p>
                <p className="mt-1 text-xs leading-5 text-white/45">{resolutionConfig[r].hint}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Modo experto */}
        <div className="rounded-[1.5rem] border border-white/10 bg-white/3 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Modo experto — umbrales manuales</p>
              <p className="mt-0.5 text-xs text-white/40">Activa si conoces los límites exactos del proceso</p>
            </div>
            <button type="button" onClick={() => setExpertMode((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${expertMode ? 'bg-cyan-400' : 'bg-white/15'}`}>
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${expertMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          {expertMode && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm text-white/50">Límite inferior</label>
                <input type="number" step="any" value={warnLow} onChange={(e) => setWarnLow(e.target.value)}
                  placeholder="ej. -22" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/25 focus:border-cyan-400/40 focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm text-white/50">Límite superior</label>
                <input type="number" step="any" value={warnHigh} onChange={(e) => setWarnHigh(e.target.value)}
                  placeholder="ej. -15" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/25 focus:border-cyan-400/40 focus:outline-none" />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <button type="submit" disabled={loading || !tsCol || !sensorCol}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 font-semibold text-neutral-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? 'Analizando…' : 'Analizar datos'}
        </button>
      </form>
    </div>
  );
}

// ─── Step 3: Results ─────────────────────────────────────────────────────────

function ResultsStep({ result, resolution, warnLow, warnHigh, sensorCol, onReset, onSaved }: {
  result: SensorAnalysisResult;
  resolution: ResolutionLevel;
  warnLow?: number;
  warnHigh?: number;
  sensorCol: string;
  onReset: () => void;
  onSaved: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [saved, setSaved] = useState(false);

  const criticalCount = result.anomalies.filter((a) => a.type === 'above_warn' || a.type === 'below_warn' || a.type === 'statistical_high' || a.type === 'statistical_low').length;
  const trendCount = result.anomalies.filter((a) => a.type === 'approaching_high' || a.type === 'approaching_low').length;
  const displayed = showAll ? result.anomalies : result.anomalies.slice(0, 10);

  const maxMean = Math.max(...result.compressedBlocks.map((b) => b.mean), ...(warnHigh !== undefined ? [warnHigh * 1.05] : []));
  const minMean = Math.min(...result.compressedBlocks.map((b) => b.mean), ...(warnLow !== undefined ? [warnLow * (warnLow < 0 ? 1.05 : 0.95)] : []));
  const chartRange = maxMean - minMean || 1;

  function barColor(mean: number) {
    if (warnHigh !== undefined && mean > warnHigh) return 'bg-rose-400/80';
    if (warnLow !== undefined && mean < warnLow) return 'bg-rose-400/80';
    if (warnHigh !== undefined && warnLow !== undefined) {
      const margin = (warnHigh - warnLow) * 0.2;
      if (mean > warnHigh - margin || mean < warnLow + margin) return 'bg-amber-400/80';
    }
    const globalMargin = (maxMean - minMean) * 0.15;
    if (mean > maxMean - globalMargin || mean < minMean + globalMargin) return 'bg-amber-400/50';
    return 'bg-cyan-300/70';
  }

  function barHeight(v: number) { return Math.max(4, ((v - minMean) / chartRange) * 100); }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Resultados</h2>
          <p className="mt-1 text-white/50 text-sm">
            <span className="text-cyan-300">{sensorCol}</span> · {result.totalPoints.toLocaleString()} puntos · Resolución {resolutionConfig[resolution].label}
            {warnHigh !== undefined && <span className="ml-2 text-white/35">· Umbrales [{warnLow}, {warnHigh}]</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {!saved && (
            <button type="button" onClick={() => { setSaved(true); onSaved(); }}
              className="shrink-0 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:brightness-110">
              Guardar demo
            </button>
          )}
          {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-300"><CheckCircle className="h-4 w-4" /> Guardada</span>}
          <button type="button" onClick={onReset} className="shrink-0 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/50 hover:bg-white/5">
            Nueva demo
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Puntos analizados', value: result.totalPoints.toLocaleString(), tone: 'neutral' },
          { label: 'Anomalías críticas', value: String(criticalCount), tone: criticalCount > 0 ? 'danger' : 'ok' },
          { label: 'Tendencias', value: String(trendCount), tone: trendCount > 0 ? 'warn' : 'ok' },
          { label: 'Media global', value: round2(result.overallMean).toString(), tone: 'neutral' },
        ].map((kpi) => {
          const toneClass = { neutral: 'border-white/10 bg-white/4', danger: 'border-rose-400/20 bg-rose-400/8', warn: 'border-amber-400/20 bg-amber-400/8', ok: 'border-emerald-400/20 bg-emerald-400/8' }[kpi.tone];
          const valClass = { neutral: 'text-white', danger: 'text-rose-200', warn: 'text-amber-200', ok: 'text-emerald-200' }[kpi.tone];
          return (
            <div key={kpi.label} className={`rounded-3xl border p-4 ${toneClass}`}>
              <p className="text-xs text-white/45">{kpi.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${valClass}`}>{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-[2rem] border border-white/10 bg-white/3 p-5">
        <p className="mb-1 text-sm font-medium text-white/70">Vista comprimida</p>
        <p className="mb-4 text-xs text-white/35">{result.compressedBlocks.length} bloques · cada barra = media de hasta 10 puntos</p>
        <div className="relative h-36 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.04),transparent)] p-3">
          {warnHigh !== undefined && (
            <div className="pointer-events-none absolute right-3 left-3 border-t border-dashed border-rose-400/40" style={{ bottom: `${barHeight(warnHigh)}%` }}>
              <span className="absolute right-0 -top-4 text-[10px] text-rose-300/60">↑ {warnHigh}</span>
            </div>
          )}
          {warnLow !== undefined && (
            <div className="pointer-events-none absolute right-3 left-3 border-t border-dashed border-amber-400/40" style={{ bottom: `${barHeight(warnLow)}%` }}>
              <span className="absolute right-0 text-[10px] text-amber-300/60">↓ {warnLow}</span>
            </div>
          )}
          <div className="flex h-full items-end gap-px overflow-hidden">
            {result.compressedBlocks.map((b, i) => (
              <div key={i} title={`Bloque ${i + 1}: ${round2(b.mean)}`}
                className={`flex-1 rounded-t-sm transition-all ${barColor(b.mean)}`}
                style={{ height: `${barHeight(b.mean)}%` }} />
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-4 text-[11px] text-white/35">
          <span><span className="inline-block h-2 w-2 rounded-sm bg-cyan-300/70 mr-1" />Normal</span>
          <span><span className="inline-block h-2 w-2 rounded-sm bg-amber-400/80 mr-1" />Tendencia</span>
          <span><span className="inline-block h-2 w-2 rounded-sm bg-rose-400/80 mr-1" />Anomalía</span>
        </div>
      </div>

      {/* Anomaly list */}
      {result.anomalies.length > 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/3 p-5">
          <p className="mb-4 text-sm font-medium text-white/70">{result.anomalies.length} eventos detectados</p>
          <div className="space-y-2">
            {displayed.map((a, i) => {
              const meta = anomalyMeta[a.type];
              const Icon = meta.trend === 'up' ? TrendingUp : TrendingDown;
              return (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-black/20 p-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border ${meta.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-px text-xs ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-white/35">fila {a.index + 1}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium">Valor: {round2(a.value)}</p>
                    <p className="text-xs text-white/40">{a.timestamp}</p>
                    {a.comparedToMean !== null && (
                      <p className="text-xs text-white/30">Media: {round2(a.comparedToMean)} · Desviación: {round2(a.deviation)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {result.anomalies.length > 10 && (
            <button type="button" onClick={() => setShowAll((v) => !v)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-2 text-sm text-white/50 hover:bg-white/5">
              {showAll ? <><ChevronUp className="h-4 w-4" /> Mostrar menos</> : <>Ver {result.anomalies.length - 10} eventos más</>}
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-4 text-sm text-emerald-200">
          <CheckCircle className="h-4 w-4 shrink-0" />
          Sin anomalías detectadas. Todos los datos están dentro de los parámetros configurados.
        </div>
      )}
    </div>
  );
}

// ─── Main Shell ──────────────────────────────────────────────────────────────

export function SensorDemoShell({ session, clientId, clientName, onSaved }: SensorDemoShellProps) {
  const [step, setStep] = useState<Step>('upload');
  const [parsed, setParsed] = useState<SensorParseResponseDto | null>(null);
  const [result, setResult] = useState<SensorAnalysisResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [cfg, setCfg] = useState<{ resolution: ResolutionLevel; warnLow?: number; warnHigh?: number; sensorCol: string; tsCol: string } | null>(null);

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
      {/* Client badge + step indicator */}
      <div className="mx-auto mb-8 max-w-5xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <span className="rounded-full border border-white/10 px-3 py-1">{clientName}</span>
        </div>
        <div className="flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${i < stepIndex ? 'bg-emerald-400/20 text-emerald-300' : i === stepIndex ? 'bg-cyan-400/20 text-cyan-200 ring-1 ring-cyan-400/40' : 'bg-white/8 text-white/30'}`}>
                {i < stepIndex ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:block ${i === stepIndex ? 'text-white/70' : 'text-white/30'}`}>{s.label}</span>
              {i < stepLabels.length - 1 && <div className={`h-px w-5 ${i < stepIndex ? 'bg-emerald-400/30' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-blue-500/4 to-fuchsia-500/8 blur-3xl" />
          <div className="relative">
            {step === 'upload' && (
              <UploadStep token={session.accessToken} fileName={fileName} setFileName={setFileName}
                onParsed={(p) => { setParsed(p); setStep('configure'); }} />
            )}
            {step === 'configure' && parsed && (
              <ConfigureStep parsed={parsed} token={session.accessToken} onBack={() => setStep('upload')}
                onAnalyze={(r, c) => { setResult(r); setCfg(c); setStep('results'); }} />
            )}
            {step === 'results' && result && cfg && (
              <ResultsStep result={result} resolution={cfg.resolution} warnLow={cfg.warnLow} warnHigh={cfg.warnHigh}
                sensorCol={cfg.sensorCol} onSaved={handleSaved}
                onReset={() => { setParsed(null); setResult(null); setCfg(null); setFileName(''); setStep('upload'); }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
