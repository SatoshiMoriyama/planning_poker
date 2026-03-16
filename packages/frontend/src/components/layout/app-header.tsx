import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
          <Link to="/" className="text-lg font-bold hover:opacity-80">
            {APP_NAME}
          </Link>
        </div>
        {center && <div className="flex-1 flex justify-center">{center}</div>}
        {right && <div className="flex-1 flex justify-end items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}
