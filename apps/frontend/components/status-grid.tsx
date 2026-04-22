import type { DashboardSummaryDto, HealthResponseDto } from '@atalayax/types';
import { MetricCard } from './ui-shell';

type StatusGridProps = {
  summary: DashboardSummaryDto;
  health: HealthResponseDto;
};

export function StatusGrid({ summary, health }: StatusGridProps) {
  const cards = [
    {
      label: 'Activos monitorizados',
      value: summary.monitoredAssets.toString(),
      hint: 'telemetría industrial activa',
    },
    {
      label: 'Alertas activas',
      value: summary.activeAlerts.toString(),
      hint: 'priorización operativa',
    },
    {
      label: 'Anomaly score',
      value: `${summary.anomalyScore}%`,
      hint: `rol actual: ${summary.currentRole}`,
    },
    {
      label: 'Backend',
      value: health.status,
      hint: new Date(health.timestamp).toLocaleString('es-ES'),
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <MetricCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
      ))}
    </section>
  );
}
