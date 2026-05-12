import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { LogOut, Truck } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { Sun, Moon } from 'lucide-react';

const DriverLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Truck className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Driver Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium">{user?.username}</span>
            <span className="text-xs text-muted-foreground">Driver</span>
          </div>
          <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={logout} className="p-2 text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DriverLayout;
