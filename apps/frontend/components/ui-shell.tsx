import type { ReactNode } from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';

type AppShellProps = {
  children: ReactNode;
  navItems?: string[];
};

export function AppShell({ children, navItems = ['Producto', 'Seguridad', 'Arquitectura', 'Dashboard'] }: AppShellProps) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.18),transparent_35%),radial-gradient(circle_at_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(to_bottom,#0a0a0a,#0a0a0a)]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/20">
                <Activity className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight">AtalayaX</p>
                <p className="text-sm text-white/45">Industrial data intelligence</p>
              </div>
            </Link>

            <nav className="flex flex-wrap gap-3 text-sm text-white/60">
              {navItems.map((item) => (
                <span key={item} className="rounded-full border border-white/10 px-4 py-2">
                  {item}
                </span>
              ))}
            </nav>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
};

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
      <p className="text-sm text-white/50">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm text-emerald-300/80">{hint}</p>
    </div>
  );
}

type RoleChipProps = {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
};

export function RoleChip({ active, children, onClick }: RoleChipProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
        active
          ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
          : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}
