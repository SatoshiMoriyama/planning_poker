import { APP_NAME } from './constants';

export function AppFooter() {
  return (
    <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
      {APP_NAME}
    </footer>
  );
}
