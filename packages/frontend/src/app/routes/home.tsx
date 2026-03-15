import { AppLayout } from '../../components/layout/app-layout';
import { HomeView } from '../../features/home/components/home-view';

export default function HomeRoute() {
  return (
    <AppLayout>
      <HomeView />
    </AppLayout>
  );
}
