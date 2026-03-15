import type { ReactNode } from 'react';
import { AppHeader } from './app-header';
import { AppFooter } from './app-footer';

interface AppLayoutProps {
  headerCenter?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AppLayout({ headerCenter, headerRight, children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader center={headerCenter} right={headerRight} />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
