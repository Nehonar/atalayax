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
