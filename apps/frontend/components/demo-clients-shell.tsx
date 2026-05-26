'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Building2, ChevronRight, Clock, Plus, Thermometer, Truck, X } from 'lucide-react';
import type { DemoClient, DemoRecord } from '@atalayax/types';
import { createClient, deleteDemo, getDemosForClient, getClients, getClient } from '../lib/demo-store';

const sectorLabel: Record<DemoClient['sector'], string> = {
  industria: 'Industria 4.0',
  logistica: 'Logística / Cadena de frío',
  otro: 'Otro sector',
};

const sectorIcon: Record<DemoClient['sector'], typeof Building2> = {
  industria: Building2,
  logistica: Truck,
  otro: Thermometer,
};

const anomalyLabels: Record<string, string> = {
  above_warn: 'Por encima del límite',
  below_warn: 'Por debajo del límite',
  approaching_high: 'Tendencia al límite alto',
  approaching_low: 'Tendencia al límite bajo',
  statistical_high: 'Pico estadístico alto',
  statistical_low: 'Pico estadístico bajo',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ─── New client form ─────────────────────────────────────────────────────────

function NewClientForm({ onCreated, onCancel }: { onCreated: (c: DemoClient) => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [sector, setSector] = useState<DemoClient['sector']>('industria');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const client = createClient(name.trim(), sector);
    onCreated(client);
  }

  return (
    <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-400/5 p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold">Nuevo cliente</h3>
        <button type="button" onClick={onCancel} className="text-white/40 hover:text-white/70">
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm text-white/55">Nombre de la empresa</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Transportes García SA"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white placeholder:text-white/30 focus:border-cyan-400/40 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-white/55">Sector</label>
          <div className="grid grid-cols-3 gap-2">
            {(['industria', 'logistica', 'otro'] as const).map((s) => {
              const Icon = sectorIcon[s];
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSector(s)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-xs transition ${
                    sector === s
                      ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200'
                      : 'border-white/10 bg-white/4 text-white/50 hover:bg-white/8'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {sectorLabel[s]}
                </button>
              );
            })}
          </div>
        </div>
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-neutral-950 transition hover:brightness-110 disabled:opacity-40"
        >
          Crear cliente
        </button>
      </form>
    </div>
  );
}

// ─── Client list ─────────────────────────────────────────────────────────────

function ClientList({ onSelect }: { onSelect: (clientId: string) => void }) {
  const [clients, setClients] = useState<DemoClient[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setClients(getClients()); }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-sm text-cyan-200">
          Demo interactiva · análisis de sensores
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">Selecciona un cliente</h1>
        <p className="mt-3 text-white/55">
          Cada cliente tiene su propio historial de demos. Crea uno nuevo o continúa con uno existente.
        </p>
      </div>

      {showForm ? (
        <NewClientForm
          onCreated={(c) => { setClients(getClients()); setShowForm(false); onSelect(c.id); }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="mb-4 flex w-full items-center gap-3 rounded-[2rem] border border-dashed border-cyan-400/30 bg-cyan-400/5 px-6 py-4 text-cyan-300 transition hover:bg-cyan-400/10"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium">Nuevo cliente</span>
        </button>
      )}

      {clients.length > 0 && (
        <div className="space-y-3">
          {clients.map((client) => {
            const Icon = sectorIcon[client.sector];
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => onSelect(client.id)}
                className="flex w-full items-center gap-4 rounded-[2rem] border border-white/10 bg-white/4 px-6 py-4 text-left transition hover:bg-white/7"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8">
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white/90">{client.name}</p>
                  <p className="mt-0.5 text-sm text-white/45">{sectorLabel[client.sector]}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/30" />
              </button>
            );
          })}
        </div>
      )}

      {clients.length === 0 && !showForm && (
        <div className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-6 text-center text-sm text-white/40">
          Aún no hay clientes. Crea el primero para empezar.
        </div>
      )}
    </div>
  );
}

// ─── Client detail ───────────────────────────────────────────────────────────

function DemoSummaryCard({
  demo,
  onView,
  onDelete,
}: {
  demo: DemoRecord;
  onView: () => void;
  onDelete: () => void;
}) {
  const criticalCount = demo.result.anomalies.filter(
    (a) => a.type === 'above_warn' || a.type === 'below_warn' || a.type === 'statistical_high' || a.type === 'statistical_low',
  ).length;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-white/90 truncate">{demo.fileName}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
            <Clock className="h-3 w-3" />
            {formatDate(demo.createdAt)}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 rounded-xl border border-white/8 p-1.5 text-white/30 hover:border-rose-400/20 hover:text-rose-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-black/20 px-2 py-2">
          <p className="text-xs text-white/40">Puntos</p>
          <p className="mt-0.5 font-semibold">{demo.totalPoints.toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl px-2 py-2 ${criticalCount > 0 ? 'bg-rose-400/10' : 'bg-black/20'}`}>
          <p className="text-xs text-white/40">Anomalías</p>
          <p className={`mt-0.5 font-semibold ${criticalCount > 0 ? 'text-rose-300' : ''}`}>{demo.anomalyCount}</p>
        </div>
        <div className="rounded-2xl bg-black/20 px-2 py-2">
          <p className="text-xs text-white/40">Resolución</p>
          <p className="mt-0.5 font-semibold">{demo.resolution}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
        <span className="truncate">{demo.sensorColumn}</span>
        {demo.warnLow !== undefined && (
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5">
            [{demo.warnLow}, {demo.warnHigh}]
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-2 text-sm text-white/60 transition hover:bg-white/6"
      >
        Ver resultados <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ClientDetail({
  clientId,
  onBack,
  onNewDemo,
  onViewDemo,
}: {
  clientId: string;
  onBack: () => void;
  onNewDemo: () => void;
  onViewDemo: (demoId: string) => void;
}) {
  const client = getClient(clientId);
  const [demos, setDemos] = useState<DemoRecord[]>([]);

  useEffect(() => { setDemos(getDemosForClient(clientId)); }, [clientId]);

  if (!client) return null;
  const Icon = sectorIcon[client.sector];

  function handleDelete(demoId: string) {
    deleteDemo(demoId);
    setDemos(getDemosForClient(clientId));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <button type="button" onClick={onBack} className="mb-6 text-sm text-white/40 hover:text-white/70">
        ← Todos los clientes
      </button>

      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/20">
          <Icon className="h-6 w-6 text-cyan-300" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{client.name}</h1>
          <p className="mt-1 text-white/50">{sectorLabel[client.sector]}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onNewDemo}
        className="mb-6 flex w-full items-center gap-3 rounded-[2rem] border border-dashed border-cyan-400/30 bg-cyan-400/5 px-6 py-4 text-cyan-300 transition hover:bg-cyan-400/10"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Nueva demo</span>
      </button>

      {demos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map((demo) => (
            <DemoSummaryCard
              key={demo.id}
              demo={demo}
              onView={() => onViewDemo(demo.id)}
              onDelete={() => handleDelete(demo.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-8 text-center text-sm text-white/40">
          Aún no hay demos para este cliente. Crea la primera.
        </div>
      )}
    </div>
  );
}

export { ClientList };
