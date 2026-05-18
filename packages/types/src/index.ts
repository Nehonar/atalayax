export const userRoles = ['admin', 'analyst', 'operator'] as const;

export type UserRole = (typeof userRoles)[number];

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
};

export type AuthSessionDto = {
  accessToken: string;
  expiresAt: string;
  user: SessionUser;
};

export type HealthResponseDto = {
  status: 'ok';
  service: 'backend';
  timestamp: string;
};

export type DashboardSummaryDto = {
  monitoredAssets: number;
  activeAlerts: number;
  anomalyScore: number;
  currentRole: UserRole;
};

export type DashboardAlertDto = {
  id: string;
  asset: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  deviation: string;
};

export type DashboardTrendDto = {
  label: string;
  values: number[];
  status: 'stable' | 'drift' | 'anomaly';
};

export type MailboxMessageDto = {
  id: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  preview: string;
  receivedAt: string;
  folder: 'inbox' | 'sent' | 'drafts';
  scope: 'internal' | 'client';
  tag: 'sales' | 'support' | 'ops' | 'audit' | 'report';
  unread: boolean;
};

export type DashboardOverviewDto = {
  summary: DashboardSummaryDto;
  widgets: string[];
  alerts: DashboardAlertDto[];
  trends: DashboardTrendDto[];
  mailbox: MailboxMessageDto[];
};

// Sensor Demo
export type SensorColumnType = 'timestamp' | 'numeric' | 'string';

export type SensorColumn = {
  name: string;
  type: SensorColumnType;
  sample: string[];
};

export type ThresholdConfig = {
  warnLow: number;
  warnHigh: number;
};

export type AnomalyEventType = 'above_warn' | 'below_warn' | 'approaching_high' | 'approaching_low';

export type AnomalyEvent = {
  timestamp: string;
  value: number;
  index: number;
  type: AnomalyEventType;
  comparedToMean: number | null;
  comparedToPrevBlock: number | null;
  deviation: number;
};

export type CompressedBlock = {
  mean: number;
  count: number;
  startTimestamp: string;
  endTimestamp: string;
  blockIndex: number;
};

export type SensorAnalysisResult = {
  totalPoints: number;
  anomalies: AnomalyEvent[];
  compressedBlocks: CompressedBlock[];
  overallMean: number;
  minValue: number;
  maxValue: number;
};

export type SensorParseResponseDto = {
  fileId: string;
  columns: SensorColumn[];
  rowCount: number;
  preview: Record<string, string>[];
};

export type SensorAnalyzeRequestDto = {
  fileId: string;
  timestampColumn: string;
  sensorColumn: string;
  warnLow: number;
  warnHigh: number;
};
