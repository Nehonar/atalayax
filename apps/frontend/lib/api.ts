import type {
  AuthSessionDto,
  DashboardOverviewDto,
  DashboardSummaryDto,
  HealthResponseDto,
  LoginRequestDto,
  UserRole,
} from '@atalayax/types';

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function sendJson<TResponse, TPayload>(path: string, payload: TPayload): Promise<TResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export function getHealth() {
  return fetchJson<HealthResponseDto>('/health');
}

export function getDashboardSummary(role: UserRole = 'analyst') {
  return fetchJson<DashboardSummaryDto>(`/dashboard/summary?role=${role}`);
}

export function getDashboardOverview(role: UserRole) {
  return fetchJson<DashboardOverviewDto>(`/dashboard/overview?role=${role}`);
}

export function login(payload: LoginRequestDto) {
  return sendJson<AuthSessionDto, LoginRequestDto>('/auth/login', payload);
}
