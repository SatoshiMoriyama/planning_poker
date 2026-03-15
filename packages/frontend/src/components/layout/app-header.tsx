import type { ReactNode } from 'react';
import { APP_NAME } from './constants';

interface AppHeaderProps {
  center?: ReactNode;
  right?: ReactNode;
}

export function AppHeader({ center, right }: AppHeaderProps) {
  return (
    <header className="border-b border-border px-6 py-3">
      <div className="mx-auto flex max-w-4xl items-center">
        <div className="flex-1">
          <span className="text-lg font-bold">{APP_NAME}</span>
        </div>
        {center && <div className="flex-1 flex justify-center">{center}</div>}
        {right && <div className="flex-1 flex justify-end items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
