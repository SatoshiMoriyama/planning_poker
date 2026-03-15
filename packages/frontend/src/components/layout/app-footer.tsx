import { Link } from 'react-router-dom';
import { APP_NAME } from './constants';

export function AppFooter() {
  return (
    <footer className="border-t border-border py-4 text-center text-sm text-muted-foreground">
      <div className="flex items-center justify-center gap-4">
        <span>{APP_NAME}</span>
        <Link to="/terms" className="underline hover:text-foreground">
          利用規約
        </Link>
      </div>
    </footer>
  );
}
