'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthSessionDto } from '@atalayax/types';
import { AppShell } from '../../components/ui-shell';
import { ClientList, ClientDetail } from '../../components/demo-clients-shell';
import { SavedDemoResultsView, SensorDemoShell } from '../../components/sensor-demo-shell';
import { readSession } from '../../lib/auth';
import { getClient, getDemo } from '../../lib/demo-store';

type Screen =
  | { view: 'clients' }
  | { view: 'client'; clientId: string }
  | { view: 'new-demo'; clientId: string }
  | { view: 'demo-result'; clientId: string; demoId: string };

export default function DemoPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSessionDto | null>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>({ view: 'clients' });

  useEffect(() => {
    const s = readSession();
    if (!s) { router.replace('/login'); return; }
    setSession(s);
    setReady(true);
  }, [router]);

  if (!ready || !session) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10 text-white/70">
        Preparando sesión...
      </main>
    );
  }

  const clientName =
    screen.view !== 'clients'
      ? (getClient(screen.clientId)?.name ?? '')
      : '';

  return (
    <AppShell navItems={[{ label: 'Dashboard', href: '/dashboard' }]}>
      <section className="mx-auto max-w-none px-4 py-14 lg:px-6">

        {/* Page header */}
        <div className="mx-auto mb-10 max-w-5xl">
          <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
            Demo interactiva · usuario autenticado
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Análisis de sensores
          </h1>
          <p className="mt-3 max-w-2xl text-lg leading-8 text-white/55">
            El algoritmo aprende del silencio, para detectar ruido.
          </p>
        </div>

        {screen.view === 'clients' && (
          <ClientList onSelect={(clientId) => setScreen({ view: 'client', clientId })} />
        )}

        {screen.view === 'client' && (
          <ClientDetail
            clientId={screen.clientId}
            onBack={() => setScreen({ view: 'clients' })}
            onNewDemo={() => setScreen({ view: 'new-demo', clientId: screen.clientId })}
            onViewDemo={(demoId) => setScreen({ view: 'demo-result', clientId: screen.clientId, demoId })}
          />
        )}

        {screen.view === 'new-demo' && (
          <SensorDemoShell
            session={session}
            clientId={screen.clientId}
            clientName={clientName}
            onSaved={() => setScreen({ view: 'client', clientId: screen.clientId })}
          />
        )}

        {screen.view === 'demo-result' && (() => {
          const demo = getDemo(screen.demoId);
          if (!demo) return <p className="text-white/40">Demo no encontrada.</p>;
          return (
            <SavedDemoResultsView
              demo={demo}
              onBack={() => setScreen({ view: 'client', clientId: screen.clientId })}
            />
          );
        })()}
      </section>
    </AppShell>
  );
}
