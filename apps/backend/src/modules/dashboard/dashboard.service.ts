import type {
  DashboardAlertDto,
  DashboardOverviewDto,
  DashboardSummaryDto,
  DashboardTrendDto,
  MailboxMessageDto,
  UserRole,
} from '@atalayax/types';

const widgetsByRole: Record<UserRole, string[]> = {
  admin: ['Gobierno de usuarios', 'Alertas críticas', 'Auditoría de accesos', 'Correo cliente e interno'],
  analyst: ['Tendencias históricas', 'Modelos de deriva', 'Importaciones XLS/CSV', 'Correo a clientes'],
  operator: ['Estado de línea', 'Alertas activas', 'Variables críticas', 'Correo interno'],
};

const summaryByRole: Record<UserRole, DashboardSummaryDto> = {
  admin: {
    monitoredAssets: 128,
    activeAlerts: 6,
    anomalyScore: 84,
    currentRole: 'admin',
  },
  analyst: {
    monitoredAssets: 128,
    activeAlerts: 3,
    anomalyScore: 81,
    currentRole: 'analyst',
  },
  operator: {
    monitoredAssets: 48,
    activeAlerts: 5,
    anomalyScore: 73,
    currentRole: 'operator',
  },
};

export class DashboardService {
  getOverview(role: UserRole): DashboardOverviewDto {
    return {
      summary: summaryByRole[role],
      widgets: widgetsByRole[role],
      alerts: this.getAlerts(role),
      trends: this.getTrends(role),
      mailbox: this.getMailbox(role),
    };
  }

  private getAlerts(role: UserRole): DashboardAlertDto[] {
    if (role === 'admin') {
      return [
        { id: 'alt-1', asset: 'Planta norte', severity: 'critical', title: 'Desviación fuera de margen', deviation: '+14.2% vibración' },
        { id: 'alt-2', asset: 'Gateway auth', severity: 'high', title: 'Intentos de acceso anómalos', deviation: '27 intentos en 15 min' },
        { id: 'alt-3', asset: 'Línea 4', severity: 'medium', title: 'Retraso de sincronización', deviation: '2 min sobre SLA' },
      ];
    }

    if (role === 'operator') {
      return [
        { id: 'alt-4', asset: 'Motor LN-04', severity: 'critical', title: 'Deriva de temperatura', deviation: '+9.4 ºC' },
        { id: 'alt-5', asset: 'Compresor C-12', severity: 'high', title: 'Pico de vibración', deviation: '+7.8 mm/s' },
        { id: 'alt-6', asset: 'Bomba B-07', severity: 'low', title: 'Aumento de consumo', deviation: '+3.1%' },
      ];
    }

    return [
      { id: 'alt-7', asset: 'Compresor C-12', severity: 'high', title: 'Deriva creciente', deviation: '+6.2% sobre baseline' },
      { id: 'alt-8', asset: 'Horno H-03', severity: 'medium', title: 'Cambio de tendencia', deviation: '-4.1% rendimiento térmico' },
      { id: 'alt-9', asset: 'Línea 2', severity: 'low', title: 'Patrón no habitual', deviation: 'Outlier en lote nocturno' },
    ];
  }

  private getTrends(role: UserRole): DashboardTrendDto[] {
    if (role === 'admin') {
      return [
        { label: 'Disponibilidad global', values: [62, 64, 65, 66, 67, 69, 71, 74], status: 'stable' },
        { label: 'Riesgo operativo', values: [30, 34, 37, 41, 45, 49, 53, 58], status: 'drift' },
      ];
    }

    if (role === 'operator') {
      return [
        { label: 'Temperatura motor', values: [28, 31, 36, 42, 49, 57, 68, 78], status: 'anomaly' },
        { label: 'Vibración línea', values: [20, 22, 25, 28, 32, 36, 38, 41], status: 'drift' },
      ];
    }

    return [
      { label: 'Baseline de vibración', values: [34, 35, 37, 38, 40, 44, 49, 56], status: 'drift' },
      { label: 'Consumo energético', values: [18, 19, 20, 22, 21, 23, 24, 26], status: 'stable' },
    ];
  }

  private getMailbox(role: UserRole): MailboxMessageDto[] {
    if (role === 'admin') {
      return [
        {
          id: 'mail-1',
          fromName: 'Marina Costa',
          fromEmail: 'marina.costa@clientenorte.com',
          subject: 'Aprobación de propuesta de monitorización para planta norte',
          preview: 'Confirmamos avance con el piloto y necesitamos calendario de despliegue para la próxima semana.',
          receivedAt: '16:12',
          folder: 'inbox',
          scope: 'client',
          tag: 'sales',
          unread: true,
        },
        {
          id: 'mail-2',
          fromName: 'Equipo de soporte',
          fromEmail: 'support@atalayax.io',
          subject: 'Respuesta enviada al cliente sobre credenciales SMTP',
          preview: 'Se ha respondido al cliente con el nuevo usuario técnico y la ventana prevista para la validación.',
          receivedAt: '14:48',
          folder: 'sent',
          scope: 'client',
          tag: 'support',
          unread: false,
        },
        {
          id: 'mail-3',
          fromName: 'Seguridad interna',
          fromEmail: 'security@atalayax.local',
          subject: 'Auditoría de permisos completada',
          preview: 'Sin cambios críticos en RBAC. Dos accesos fuera de horario revisados y documentados en el informe.',
          receivedAt: '12:03',
          folder: 'inbox',
          scope: 'internal',
          tag: 'audit',
          unread: true,
        },
      ];
    }

    if (role === 'operator') {
      return [
        {
          id: 'mail-4',
          fromName: 'Mantenimiento central',
          fromEmail: 'maintenance@atalayax.local',
          subject: 'Parada planificada aprobada',
          preview: 'La intervención sobre el compresor C-12 se ejecutará a las 18:30 y queda confirmada con producción.',
          receivedAt: '11:27',
          folder: 'inbox',
          scope: 'internal',
          tag: 'ops',
          unread: false,
        },
        {
          id: 'mail-5',
          fromName: 'Turno noche',
          fromEmail: 'ops.norte@atalayax.local',
          subject: 'Incidencia escalada a revisión de línea 4',
          preview: 'Se deja trazabilidad interna de la incidencia y se solicita validación del responsable de turno.',
          receivedAt: '10:14',
          folder: 'inbox',
          scope: 'internal',
          tag: 'ops',
          unread: true,
        },
        {
          id: 'mail-6',
          fromName: 'Borrador operativo',
          fromEmail: 'operator@atalayax.io',
          subject: 'Resumen pendiente para mantenimiento',
          preview: 'Borrador guardado para completar el parte interno antes del cambio de turno.',
          receivedAt: '09:10',
          folder: 'drafts',
          scope: 'internal',
          tag: 'report',
          unread: false,
        },
      ];
    }

    return [
      {
        id: 'mail-7',
        fromName: 'Lucía Herrero',
        fromEmail: 'lucia.herrero@clienteoeste.com',
        subject: 'Consulta sobre informe de deriva entregado ayer',
        preview: 'El cliente pide ampliar el detalle del baseline y adjuntar comparativa semanal antes de la reunión.',
        receivedAt: '15:21',
        folder: 'inbox',
        scope: 'client',
        tag: 'support',
        unread: true,
      },
      {
        id: 'mail-8',
        fromName: 'Analyst Team',
        fromEmail: 'reports@atalayax.io',
        subject: 'Envío realizado de informe de rendimiento térmico',
        preview: 'El informe se ha remitido al cliente con anexos CSV y comentario ejecutivo para dirección de planta.',
        receivedAt: '13:04',
        folder: 'sent',
        scope: 'client',
        tag: 'report',
        unread: false,
      },
      {
        id: 'mail-9',
        fromName: 'Data Ops',
        fromEmail: 'ops.norte@atalayax.local',
        subject: 'Nueva carga histórica lista para revisión interna',
        preview: 'Se ha recibido una nueva carga con 14.532 muestras para la planta oeste y ya está disponible para análisis.',
        receivedAt: '09:41',
        folder: 'inbox',
        scope: 'internal',
        tag: 'ops',
        unread: true,
      },
    ];
  }
}
