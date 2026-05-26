import type { AnomalyEvent, DemoRecord, DriftSegment, SensorAnalysisResult, TimePattern } from '@atalayax/types';

const resolutionLabel: Record<1 | 2 | 3, string> = { 1: 'General', 2: 'Equilibrado', 3: 'Fino' };

const anomalyLabel: Record<AnomalyEvent['type'], string> = {
  above_warn:       'Por encima del límite',
  below_warn:       'Por debajo del límite',
  approaching_high: 'Tendencia al límite alto',
  approaching_low:  'Tendencia al límite bajo',
  statistical_high: 'Pico estadístico alto',
  statistical_low:  'Pico estadístico bajo',
  drift_up:         'Deriva al alza',
  drift_down:       'Deriva a la baja',
};

const anomalyColor: Record<AnomalyEvent['type'], string> = {
  above_warn:       '#fca5a5',
  below_warn:       '#fcd34d',
  approaching_high: '#fdba74',
  approaching_low:  '#fde68a',
  statistical_high: '#e9d5ff',
  statistical_low:  '#c4b5fd',
  drift_up:         '#fdba74',
  drift_down:       '#bae6fd',
};

function r2(n: number) { return Math.round(n * 100) / 100; }
function pad2(n: number) { return String(n).padStart(2, '0'); }

function driftRows(segments: DriftSegment[]): string {
  if (segments.length === 0) return '';
  const rows = segments.map((s) => `
    <tr>
      <td>${s.direction === 'up' ? '↑ Al alza' : '↓ A la baja'}</td>
      <td>${s.blockCount} bloques</td>
      <td>${r2(s.startMean)} → ${r2(s.endMean)}</td>
      <td>${r2(s.totalDrift)}</td>
      <td>${s.startTimestamp}</td>
    </tr>`).join('');
  return `
    <h2>Tramos de deriva detectados</h2>
    <table>
      <thead><tr><th>Dirección</th><th>Duración</th><th>Media inicio → fin</th><th>Deriva total</th><th>Inicio</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function patternRows(patterns: TimePattern[]): string {
  if (patterns.length === 0) return '';
  const rows = patterns.map((p) => `
    <tr>
      <td>${pad2(p.hour)}:00 – ${pad2((p.hour + 1) % 24)}:00</td>
      <td>${p.anomalyCount}</td>
      <td>${p.totalPoints}</td>
      <td>${p.significance.toFixed(1)}×</td>
    </tr>`).join('');
  return `
    <h2>Patrones horarios</h2>
    <p class="sub">Franjas con anomalías ≥ 2× la tasa media. Pueden indicar causas externas recurrentes.</p>
    <table>
      <thead><tr><th>Franja horaria</th><th>Anomalías</th><th>Puntos totales</th><th>Significancia</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function anomalyRows(anomalies: AnomalyEvent[]): string {
  return anomalies.map((a) => `
    <tr>
      <td>${a.index + 1}</td>
      <td>${a.timestamp}</td>
      <td>${r2(a.value)}</td>
      <td><span class="badge" style="background:${anomalyColor[a.type]}22;border:1px solid ${anomalyColor[a.type]}66;color:#1e293b">${anomalyLabel[a.type]}</span></td>
      <td>${a.comparedToMean !== null ? r2(a.comparedToMean) : '—'}</td>
      <td>${r2(a.deviation)}</td>
    </tr>`).join('');
}

export function buildReport(demo: DemoRecord, clientName: string): string {
  const result: SensorAnalysisResult = demo.result;
  const criticalCount = result.anomalies.filter(
    (a) => a.type === 'above_warn' || a.type === 'below_warn' || a.type === 'statistical_high' || a.type === 'statistical_low',
  ).length;

  const dateStr = new Date(demo.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe AtalayaX – ${demo.fileName}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background: #fff; padding: 48px 56px; font-size: 14px; line-height: 1.6; }
  @media print { body { padding: 0; } @page { margin: 2cm; } }

  header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; margin-bottom: 32px; }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand-icon { width: 44px; height: 44px; border-radius: 12px; background: #ecfeff; border: 1px solid #a5f3fc; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .brand-name { font-size: 20px; font-weight: 700; color: #0e7490; letter-spacing: -0.5px; }
  .brand-sub { font-size: 12px; color: #64748b; }
  .report-meta { text-align: right; font-size: 13px; color: #64748b; }
  .report-meta strong { display: block; font-size: 15px; color: #1e293b; margin-bottom: 2px; }

  h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
  h2 { font-size: 16px; font-weight: 600; color: #0f172a; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
  .sub { font-size: 13px; color: #64748b; margin-top: -6px; margin-bottom: 12px; }

  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 12px; }
  .kpi { border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 16px; }
  .kpi-label { font-size: 12px; color: #64748b; }
  .kpi-value { font-size: 26px; font-weight: 700; margin-top: 4px; }
  .kpi.danger { border-color: #fca5a5; background: #fff1f2; }
  .kpi.danger .kpi-value { color: #be123c; }
  .kpi.warn { border-color: #fde68a; background: #fefce8; }
  .kpi.warn .kpi-value { color: #a16207; }
  .kpi.ok { border-color: #bbf7d0; background: #f0fdf4; }
  .kpi.ok .kpi-value { color: #15803d; }

  .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-top: 12px; }
  .config-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  .config-row span:first-child { color: #64748b; }
  .config-row span:last-child { font-weight: 600; color: #0f172a; }

  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 4px; }
  thead tr { background: #f8fafc; }
  th { padding: 9px 12px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
  td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #f8fafc; }

  .badge { display: inline-block; border-radius: 20px; padding: 2px 10px; font-size: 12px; font-weight: 500; white-space: nowrap; }

  footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
</style>
</head>
<body>

<header>
  <div class="brand">
    <div class="brand-icon">◎</div>
    <div>
      <div class="brand-name">AtalayaX</div>
      <div class="brand-sub">Industrial data intelligence</div>
    </div>
  </div>
  <div class="report-meta">
    <strong>Informe de análisis de sensores</strong>
    <span>Cliente: ${clientName}</span><br>
    <span>${dateStr}</span>
  </div>
</header>

<h1>${demo.fileName}</h1>
<p class="sub">Sensor: <strong>${demo.sensorColumn}</strong> · Timestamp: <strong>${demo.timestampColumn}</strong></p>

<div class="kpi-grid">
  <div class="kpi">
    <div class="kpi-label">Puntos analizados</div>
    <div class="kpi-value">${result.totalPoints.toLocaleString('es-ES')}</div>
  </div>
  <div class="kpi ${criticalCount > 0 ? 'danger' : 'ok'}">
    <div class="kpi-label">Anomalías críticas</div>
    <div class="kpi-value">${criticalCount}</div>
  </div>
  <div class="kpi ${result.driftSegments.length > 0 ? 'warn' : 'ok'}">
    <div class="kpi-label">Tramos de deriva</div>
    <div class="kpi-value">${result.driftSegments.length}</div>
  </div>
  <div class="kpi ${result.timePatterns.length > 0 ? 'warn' : 'ok'}">
    <div class="kpi-label">Patrones horarios</div>
    <div class="kpi-value">${result.timePatterns.length}</div>
  </div>
</div>

<h2>Configuración del análisis</h2>
<div class="config-grid">
  <div class="config-row"><span>Media global</span><span>${r2(result.overallMean)}</span></div>
  <div class="config-row"><span>Resolución</span><span>${resolutionLabel[demo.resolution]}</span></div>
  <div class="config-row"><span>Valor mínimo</span><span>${r2(result.minValue)}</span></div>
  <div class="config-row"><span>Límite inferior</span><span>${demo.warnLow}</span></div>
  <div class="config-row"><span>Valor máximo</span><span>${r2(result.maxValue)}</span></div>
  <div class="config-row"><span>Límite superior</span><span>${demo.warnHigh}</span></div>
</div>

${driftRows(result.driftSegments)}
${patternRows(result.timePatterns)}

<h2>Listado de anomalías (${result.anomalies.length})</h2>
${result.anomalies.length > 0 ? `
<table>
  <thead>
    <tr><th>Fila</th><th>Timestamp</th><th>Valor</th><th>Tipo</th><th>Media ref.</th><th>Desviación</th></tr>
  </thead>
  <tbody>${anomalyRows(result.anomalies)}</tbody>
</table>` : '<p class="sub">No se detectaron anomalías dentro del rango configurado.</p>'}

<footer>
  AtalayaX · El algoritmo aprende del silencio, para detectar ruido. · Informe generado automáticamente el ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
</footer>

<script>window.print();</script>
</body>
</html>`;
}

export function openReport(demo: DemoRecord, clientName: string) {
  const html = buildReport(demo, clientName);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank');
  if (win) {
    win.addEventListener('afterprint', () => URL.revokeObjectURL(url));
  }
}
