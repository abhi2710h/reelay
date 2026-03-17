import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import SideNav from './SideNav';

export default function Layout() {
  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      <SideNav />
      <main className="flex-1 min-w-0 overflow-hidden relative">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
