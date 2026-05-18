'use client';

import { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  ChevronUp,
  FileSpreadsheet,
  Loader2,
  TrendingDown,
  TrendingUp,
  Upload,
} from 'lucide-react';
import type { AnomalyEvent, AuthSessionDto, SensorAnalysisResult, SensorColumn, SensorParseResponseDto } from '@atalayax/types';
import { analyzeSensorData, uploadSensorFile } from '../lib/api';

type Step = 'upload' | 'configure' | 'results';

type SensorDemoShellProps = {
  session: AuthSessionDto;
};

const anomalyLabels: Record<AnomalyEvent['type'], { label: string; color: string }> = {
  above_warn: { label: 'Por encima del límite', color: 'text-rose-300 border-rose-400/20 bg-rose-400/10' },
  below_warn: { label: 'Por debajo del límite', color: 'text-amber-300 border-amber-400/20 bg-amber-400/10' },
  approaching_high: { label: 'Tendencia al límite alto', color: 'text-orange-300 border-orange-400/20 bg-orange-400/10' },
  approaching_low: { label: 'Tendencia al límite bajo', color: 'text-yellow-300 border-yellow-400/20 bg-yellow-400/10' },
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

// ─── Step 1: Upload ──────────────────────────────────────────────────────────

function UploadStep({
  onParsed,
  token,
}: {
  onParsed: (result: SensorParseResponseDto) => void;
  token: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setLoading(true);
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
      <div className="mb-8">
        <h2 className="text-3xl font-semibold tracking-tight">Sube tu archivo de sensores</h2>
        <p className="mt-3 text-white/60">
          Acepta ficheros <span className="text-cyan-300">.xlsx</span>,{' '}
          <span className="text-cyan-300">.xls</span> y{' '}
          <span className="text-cyan-300">.csv</span> de hasta 10 MB. El archivo debe tener al
          menos una columna de timestamp y una columna de valores numéricos.
        </p>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) void handleFile(file);
        }}
        className={`flex w-full flex-col items-center justify-center gap-5 rounded-[2rem] border-2 border-dashed px-8 py-16 transition ${
          dragging
            ? 'border-cyan-400/60 bg-cyan-400/8'
            : 'border-white/15 bg-white/4 hover:border-white/25 hover:bg-white/6'
        } ${loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        {loading ? (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-cyan-300" />
            <p className="text-white/70">Procesando archivo…</p>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/20">
              <Upload className="h-7 w-7 text-cyan-300" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white/90">
                Arrastra el archivo aquí o haz clic para seleccionar
              </p>
              <p className="mt-2 text-sm text-white/45">.xlsx · .xls · .csv · máx 10 MB</p>
            </div>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
    </div>
  );
}

// ─── Step 2: Configure ───────────────────────────────────────────────────────

function ConfigureStep({
  parsed,
  onAnalyze,
  onBack,
  token,
}: {
  parsed: SensorParseResponseDto;
  onAnalyze: (result: SensorAnalysisResult, warnLow: number, warnHigh: number, sensorCol: string) => void;
  onBack: () => void;
  token: string;
}) {
  const timestampCols = parsed.columns.filter((c) => c.type === 'timestamp');
  const numericCols = parsed.columns.filter((c) => c.type === 'numeric');
  const allCols = parsed.columns;

  const [tsCol, setTsCol] = useState(timestampCols[0]?.name ?? allCols[0]?.name ?? '');
  const [sensorCol, setSensorCol] = useState(numericCols[0]?.name ?? allCols[1]?.name ?? '');
  const [warnLow, setWarnLow] = useState('');
  const [warnHigh, setWarnHigh] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const low = parseFloat(warnLow);
    const high = parseFloat(warnHigh);

    if (isNaN(low) || isNaN(high)) {
      setError('Introduce valores numéricos válidos para los umbrales.');
      return;
    }
    if (low >= high) {
      setError('El límite inferior debe ser menor que el superior.');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeSensorData(
        { fileId: parsed.fileId, timestampColumn: tsCol, sensorColumn: sensorCol, warnLow: low, warnHigh: high },
        token,
      );
      onAnalyze(result, low, high, sensorCol);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en el análisis');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Configura el análisis</h2>
          <p className="mt-3 text-white/60">
            Archivo procesado:{' '}
            <span className="text-cyan-300">{parsed.rowCount.toLocaleString()} filas</span>,{' '}
            <span className="text-cyan-300">{parsed.columns.length} columnas</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
        >
          ← Cambiar archivo
        </button>
      </div>

      {/* Preview table */}
      <div className="mb-6 overflow-x-auto rounded-2xl border border-white/10 bg-white/4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              {parsed.columns.map((col) => (
                <th key={col.name} className="px-4 py-3 text-left font-medium text-white/55">
                  <div className="flex items-center gap-2">
                    {col.name}
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        col.type === 'timestamp'
                          ? 'border-cyan-400/20 bg-cyan-400/8 text-cyan-300'
                          : col.type === 'numeric'
                            ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-300'
                            : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      {col.type}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsed.preview.map((row, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0">
                {parsed.columns.map((col) => (
                  <td key={col.name} className="px-4 py-2.5 text-white/70">
                    {row[col.name] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldGroup label="Columna de timestamp">
            <ColSelect value={tsCol} onChange={setTsCol} columns={allCols} highlight="timestamp" />
          </FieldGroup>
          <FieldGroup label="Columna de sensor (numérica)">
            <ColSelect value={sensorCol} onChange={setSensorCol} columns={allCols} highlight="numeric" />
          </FieldGroup>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5">
          <p className="mb-4 text-sm font-medium text-white/80">Umbrales de aviso</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="Límite inferior (warnLow)">
              <input
                type="number"
                step="any"
                value={warnLow}
                onChange={(e) => setWarnLow(e.target.value)}
                placeholder="ej. 4"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none"
              />
            </FieldGroup>
            <FieldGroup label="Límite superior (warnHigh)">
              <input
                type="number"
                step="any"
                value={warnHigh}
                onChange={(e) => setWarnHigh(e.target.value)}
                placeholder="ej. 12"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none"
              />
            </FieldGroup>
          </div>
          <p className="mt-3 text-xs text-white/40">
            Se detectarán anomalías fuera del rango y tendencias que se acerquen al 20% de los límites.
          </p>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || !tsCol || !sensorCol}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 font-semibold text-neutral-950 shadow-lg shadow-cyan-400/20 transition hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? 'Analizando…' : 'Analizar datos'}
        </button>
      </form>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/55">{label}</label>
      {children}
    </div>
  );
}

function ColSelect({
  value,
  onChange,
  columns,
  highlight,
}: {
  value: string;
  onChange: (v: string) => void;
  columns: SensorColumn[];
  highlight: 'timestamp' | 'numeric';
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white focus:border-cyan-400/40 focus:outline-none"
    >
      {columns.map((col) => (
        <option key={col.name} value={col.name}>
          {col.name} ({col.type}{col.type === highlight ? ' ✓' : ''})
        </option>
      ))}
    </select>
  );
}

// ─── Step 3: Results ─────────────────────────────────────────────────────────

function ResultsStep({
  result,
  warnLow,
  warnHigh,
  sensorCol,
  onReset,
}: {
  result: SensorAnalysisResult;
  warnLow: number;
  warnHigh: number;
  sensorCol: string;
  onReset: () => void;
}) {
  const [showAllAnomalies, setShowAllAnomalies] = useState(false);

  const criticalCount = result.anomalies.filter(
    (a) => a.type === 'above_warn' || a.type === 'below_warn',
  ).length;
  const trendCount = result.anomalies.filter(
    (a) => a.type === 'approaching_high' || a.type === 'approaching_low',
  ).length;

  const displayedAnomalies = showAllAnomalies ? result.anomalies : result.anomalies.slice(0, 10);

  // Chart: compressed blocks as bars, colored by anomaly proximity
  const maxMean = Math.max(...result.compressedBlocks.map((b) => b.mean), warnHigh * 1.1);
  const minMean = Math.min(...result.compressedBlocks.map((b) => b.mean), warnLow * 0.9);
  const chartRange = maxMean - minMean || 1;

  function barColor(mean: number) {
    if (mean > warnHigh || mean < warnLow) return 'bg-rose-400/80';
    const range = warnHigh - warnLow;
    const margin = range * 0.2;
    if (mean > warnHigh - margin || mean < warnLow + margin) return 'bg-amber-400/80';
    return 'bg-cyan-300/70';
  }

  function barHeight(mean: number) {
    return Math.max(4, ((mean - minMean) / chartRange) * 100);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Resultados del análisis</h2>
          <p className="mt-2 text-white/55">
            Sensor: <span className="text-cyan-300">{sensorCol}</span> ·{' '}
            <span className="text-white/70">{result.totalPoints.toLocaleString()} puntos</span> ·
            Rango permitido [{warnLow}, {warnHigh}]
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 rounded-2xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5"
        >
          Nueva demo
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Puntos totales" value={result.totalPoints.toLocaleString()} tone="neutral" />
        <KpiCard label="Anomalías críticas" value={String(criticalCount)} tone={criticalCount > 0 ? 'danger' : 'ok'} />
        <KpiCard label="Tendencias detectadas" value={String(trendCount)} tone={trendCount > 0 ? 'warn' : 'ok'} />
        <KpiCard label="Media global" value={round2(result.overallMean).toString()} tone="neutral" />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatBox label="Mínimo registrado" value={round2(result.minValue)} warn={result.minValue < warnLow} />
        <StatBox label="Media global" value={round2(result.overallMean)} />
        <StatBox label="Máximo registrado" value={round2(result.maxValue)} warn={result.maxValue > warnHigh} />
      </div>

      {/* Compressed-blocks chart */}
      <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">Vista comprimida por bloques</p>
            <p className="mt-1 text-sm text-white/50">
              {result.compressedBlocks.length} bloque{result.compressedBlocks.length !== 1 ? 's' : ''} de hasta 10
              puntos. Cada barra representa la media del bloque.
            </p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cyan-300/70" /> Normal
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400/80" /> Tendencia
            </span>
            <span className="flex items-center gap-1.5 text-white/50">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-rose-400/80" /> Anomalía
            </span>
          </div>
        </div>

        {/* Threshold lines visual hint */}
        <div className="relative h-40 rounded-2xl bg-[linear-gradient(180deg,rgba(34,211,238,0.05),rgba(34,211,238,0.01))] p-3">
          {/* Threshold markers */}
          <div
            className="absolute right-3 left-3 border-t border-dashed border-rose-400/40"
            style={{ bottom: `${barHeight(warnHigh)}%` }}
          >
            <span className="absolute right-0 -top-4 text-[10px] text-rose-300/70">↑ {warnHigh}</span>
          </div>
          <div
            className="absolute right-3 left-3 border-t border-dashed border-amber-400/40"
            style={{ bottom: `${barHeight(warnLow)}%` }}
          >
            <span className="absolute right-0 text-[10px] text-amber-300/70">↓ {warnLow}</span>
          </div>

          <div className="flex h-full items-end gap-0.5 overflow-hidden">
            {result.compressedBlocks.map((block, i) => (
              <div
                key={i}
                title={`Bloque ${i + 1}: media=${round2(block.mean)}, ${block.count} puntos\n${block.startTimestamp}`}
                className={`flex-1 rounded-t-sm transition-all ${barColor(block.mean)}`}
                style={{ height: `${barHeight(block.mean)}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly list */}
      {result.anomalies.length > 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Eventos detectados</p>
              <p className="mt-1 text-sm text-white/50">{result.anomalies.length} eventos en total</p>
            </div>
          </div>
          <div className="space-y-2">
            {displayedAnomalies.map((anomaly, i) => {
              const meta = anomalyLabels[anomaly.type];
              const Icon = anomaly.type === 'above_warn' || anomaly.type === 'approaching_high' ? TrendingUp : TrendingDown;
              return (
                <div key={i} className="flex items-start gap-4 rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${meta.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${meta.color}`}>{meta.label}</span>
                      <span className="text-xs text-white/40">fila {anomaly.index + 1}</span>
                    </div>
                    <p className="mt-1 font-medium text-white/90">Valor: {round2(anomaly.value)}</p>
                    <p className="mt-0.5 text-sm text-white/50">{anomaly.timestamp}</p>
                    {anomaly.comparedToMean !== null ? (
                      <p className="mt-0.5 text-xs text-white/35">
                        Media comparativa: {round2(anomaly.comparedToMean)} · Desviación: {round2(anomaly.deviation)}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
          {result.anomalies.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAllAnomalies((v) => !v)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-2.5 text-sm text-white/60 hover:bg-white/5"
            >
              {showAllAnomalies ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Mostrar menos
                </>
              ) : (
                <>
                  Ver los {result.anomalies.length - 10} eventos restantes
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-5 text-emerald-200">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p>Sin anomalías detectadas. Todos los datos están dentro del rango configurado.</p>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, tone }: { label: string; value: string; tone: 'neutral' | 'danger' | 'warn' | 'ok' }) {
  const toneClass = {
    neutral: 'border-white/10 bg-white/4',
    danger: 'border-rose-400/20 bg-rose-400/8',
    warn: 'border-amber-400/20 bg-amber-400/8',
    ok: 'border-emerald-400/20 bg-emerald-400/8',
  }[tone];
  const valueClass = {
    neutral: 'text-white',
    danger: 'text-rose-200',
    warn: 'text-amber-200',
    ok: 'text-emerald-200',
  }[tone];

  return (
    <div className={`rounded-3xl border p-5 ${toneClass}`}>
      <p className="text-sm text-white/50">{label}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatBox({ label, value, warn = false }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${warn ? 'border-rose-400/20 bg-rose-400/8' : 'border-white/10 bg-white/4'}`}>
      <p className="text-sm text-white/50">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${warn ? 'text-rose-200' : 'text-white'}`}>{value}</p>
    </div>
  );
}

// ─── Main Shell ──────────────────────────────────────────────────────────────

export function SensorDemoShell({ session }: SensorDemoShellProps) {
  const [step, setStep] = useState<Step>('upload');
  const [parsed, setParsed] = useState<SensorParseResponseDto | null>(null);
  const [result, setResult] = useState<SensorAnalysisResult | null>(null);
  const [lastWarnLow, setLastWarnLow] = useState(0);
  const [lastWarnHigh, setLastWarnHigh] = useState(0);
  const [lastSensorCol, setLastSensorCol] = useState('');

  const stepLabels: { key: Step; label: string }[] = [
    { key: 'upload', label: '1. Subir archivo' },
    { key: 'configure', label: '2. Configurar' },
    { key: 'results', label: '3. Resultados' },
  ];

  const stepIndex = stepLabels.findIndex((s) => s.key === step);

  return (
    <section className="mx-auto max-w-none px-4 py-16 lg:px-6">
      {/* Header */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
            Demo interactiva · usuario autenticado
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Análisis de sensores</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/60">
          Sube un Excel con datos de sensores, configura los umbrales y detecta anomalías y
          tendencias con el algoritmo de compresión jerárquica de AtalayaX.
        </p>

        {/* Step indicator */}
        <div className="mt-8 flex items-center gap-2">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  i < stepIndex
                    ? 'bg-emerald-400/20 text-emerald-300'
                    : i === stepIndex
                      ? 'bg-cyan-400/20 text-cyan-200 ring-1 ring-cyan-400/40'
                      : 'bg-white/8 text-white/35'
                }`}
              >
                {i < stepIndex ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-sm sm:block ${i === stepIndex ? 'text-white/80' : 'text-white/35'}`}>
                {s.label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className={`h-px w-6 ${i < stepIndex ? 'bg-emerald-400/30' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Panel */}
      <div className="mx-auto mt-10 max-w-5xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 p-6 shadow-2xl backdrop-blur sm:p-8">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-fuchsia-500/10 blur-3xl" />
          <div className="relative">
            {step === 'upload' && (
              <UploadStep
                token={session.accessToken}
                onParsed={(p) => {
                  setParsed(p);
                  setStep('configure');
                }}
              />
            )}
            {step === 'configure' && parsed && (
              <ConfigureStep
                parsed={parsed}
                token={session.accessToken}
                onBack={() => setStep('upload')}
                onAnalyze={(r, low, high, col) => {
                  setResult(r);
                  setLastWarnLow(low);
                  setLastWarnHigh(high);
                  setLastSensorCol(col);
                  setStep('results');
                }}
              />
            )}
            {step === 'results' && result && (
              <ResultsStep
                result={result}
                warnLow={lastWarnLow}
                warnHigh={lastWarnHigh}
                sensorCol={lastSensorCol}
                onReset={() => {
                  setParsed(null);
                  setResult(null);
                  setStep('upload');
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Algorithm explanation */}
      <div className="mx-auto mt-10 max-w-5xl rounded-[2rem] border border-white/8 bg-white/3 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-cyan-300/70" />
          <p className="font-medium text-white/70">Algoritmo de compresión jerárquica</p>
        </div>
        <div className="mt-4 grid gap-4 text-sm text-white/50 sm:grid-cols-3">
          <div>
            <p className="mb-1 font-medium text-white/70">Nivel 0 — Raw buffer</p>
            <p>Cada nuevo punto se compara con el anterior y con la media del bloque activo (hasta 10 puntos).</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-white/70">Nivel 1 — Compresión por bloque</p>
            <p>Cada 10 puntos se comprimen en una media. Se conserva el bloque anterior como referencia.</p>
          </div>
          <div>
            <p className="mb-1 font-medium text-white/70">Estado de comparación</p>
            <p>
              En cualquier momento: máx 10 puntos raw + 1 media de bloque previo + 1 super-media = 12 unidades
              de comparación. La precisión no se pierde: media de medias = media exacta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
