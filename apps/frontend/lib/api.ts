import type {
  AuthSessionDto,
  DashboardOverviewDto,
  DashboardSummaryDto,
  HealthResponseDto,
  LoginRequestDto,
  SensorAnalysisResult,
  SensorAnalyzeRequestDto,
  SensorParseResponseDto,
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

export async function uploadSensorFile(file: File, token: string): Promise<SensorParseResponseDto> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/sensor-demo/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error ${response.status}`);
  }

  return response.json() as Promise<SensorParseResponseDto>;
}

export async function analyzeSensorData(
  payload: SensorAnalyzeRequestDto,
  token: string,
): Promise<SensorAnalysisResult> {
  const response = await fetch(`${API_URL}/sensor-demo/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Error ${response.status}`);
  }

  return response.json() as Promise<SensorAnalysisResult>;
}
