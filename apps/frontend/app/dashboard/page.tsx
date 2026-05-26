'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthSessionDto } from '@atalayax/types';
import { DashboardShell } from '../../components/dashboard-shell';
import { AppShell } from '../../components/ui-shell';
import { readSession } from '../../lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSessionDto | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const currentSession = readSession();

    if (!currentSession) {
      router.replace('/login');
      return;
    }

    setSession(currentSession);
    setReady(true);
  }, [router]);

  if (!ready || !session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 text-white/70">
        Preparando sesión...
      </main>
    );
  }

  return (
    <AppShell navItems={['Alertas', 'Tendencias', 'Correo', { label: 'Demo Sensores', href: '/demo' }]}>
      <DashboardShell
        session={session}
        onLogout={() => {
          setSession(null);
          router.replace('/login');
        }}
      />
    </AppShell>
  );
}
