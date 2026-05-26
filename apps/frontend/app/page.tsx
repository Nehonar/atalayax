import { ArchitectureSection } from '../components/architecture-section';
import { Hero } from '../components/hero';
import { AppShell } from '../components/ui-shell';

export default function HomePage() {
  return (
    <AppShell>
      <Hero />
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <ArchitectureSection />
      </section>
    </AppShell>
  );
}
