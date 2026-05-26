'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthSessionDto } from '@atalayax/types';
import { AppShell } from '../../components/ui-shell';
import { ClientList, ClientDetail } from '../../components/demo-clients-shell';
import { SensorDemoShell } from '../../components/sensor-demo-shell';
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
          // Re-render results directly from stored record
          return (
            <div className="mx-auto max-w-5xl">
              <button type="button" onClick={() => setScreen({ view: 'client', clientId: screen.clientId })}
                className="mb-6 text-sm text-white/40 hover:text-white/70">
                ← Volver a {clientName}
              </button>
              <div className="rounded-[2rem] border border-white/10 bg-white/4 p-6 sm:p-8">
                <p className="text-sm text-white/40 mb-1">{new Date(demo.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <h2 className="text-2xl font-semibold">{demo.fileName}</h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/40">
                  <span className="rounded-full border border-white/10 px-2 py-1">{demo.sensorColumn}</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">{demo.totalPoints.toLocaleString()} puntos</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">{demo.anomalyCount} anomalías</span>
                  <span className="rounded-full border border-white/10 px-2 py-1">Resolución {demo.resolution}</span>
                  {demo.warnLow !== undefined && <span className="rounded-full border border-white/10 px-2 py-1">Umbrales [{demo.warnLow}, {demo.warnHigh}]</span>}
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </AppShell>
  );
}
