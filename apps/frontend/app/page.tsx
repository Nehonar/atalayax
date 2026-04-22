import { ArchitectureSection } from '../components/architecture-section';
import { Hero } from '../components/hero';
import { StatusGrid } from '../components/status-grid';
import { AppShell } from '../components/ui-shell';
import { getDashboardSummary, getHealth } from '../lib/api';

export default async function HomePage() {
  const [health, summary] = await Promise.all([getHealth(), getDashboardSummary()]);

  return (
    <AppShell>
      <Hero />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <StatusGrid summary={summary} health={health} />
      </section>
      <section className="mx-auto max-w-7xl px-6 py-20">
        <ArchitectureSection />
      </section>
    </AppShell>
  );
}
