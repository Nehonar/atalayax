'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginPanel } from '../../components/login-panel';
import { AppShell } from '../../components/ui-shell';
import { readSession } from '../../lib/auth';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (readSession()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <AppShell navItems={['Producto', 'Login', 'Seguridad', 'Roles']}>
      <LoginPanel onAuthenticated={() => router.push('/demo')} />
    </AppShell>
  );
}
