import type { AuthSessionDto } from '@atalayax/types';

const SESSION_KEY = 'atalayax.demo.session';

export function readSession(): AuthSessionDto | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSessionDto;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function writeSession(session: AuthSessionDto) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
