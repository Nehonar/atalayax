import type { DemoClient, DemoRecord } from '@atalayax/types';

const STORE_KEY = 'atalayax.demo.store';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

type Store = {
  clients: DemoClient[];
  demos: DemoRecord[];
};

function load(): Store {
  if (typeof window === 'undefined') return { clients: [], demos: [] };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Store) : { clients: [], demos: [] };
  } catch {
    return { clients: [], demos: [] };
  }
}

function save(store: Store): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function getClients(): DemoClient[] {
  return load().clients;
}

export function getClient(id: string): DemoClient | undefined {
  return load().clients.find((c) => c.id === id);
}

export function createClient(name: string, sector: DemoClient['sector']): DemoClient {
  const store = load();
  const client: DemoClient = {
    id: uid(),
    name,
    sector,
    createdAt: new Date().toISOString(),
  };
  store.clients.unshift(client);
  save(store);
  return client;
}

export function getDemosForClient(clientId: string): DemoRecord[] {
  return load().demos.filter((d) => d.clientId === clientId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getDemo(demoId: string): DemoRecord | undefined {
  return load().demos.find((d) => d.id === demoId);
}

export function saveDemo(record: Omit<DemoRecord, 'id' | 'createdAt'>): DemoRecord {
  const store = load();
  const demo: DemoRecord = {
    ...record,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  store.demos.unshift(demo);
  save(store);
  return demo;
}

export function deleteDemo(demoId: string): void {
  const store = load();
  store.demos = store.demos.filter((d) => d.id !== demoId);
  save(store);
}

export function deleteClient(clientId: string): void {
  const store = load();
  store.clients = store.clients.filter((c) => c.id !== clientId);
  store.demos = store.demos.filter((d) => d.clientId !== clientId);
  save(store);
}

export function clearAllData(): void {
  localStorage.removeItem(STORE_KEY);
}
