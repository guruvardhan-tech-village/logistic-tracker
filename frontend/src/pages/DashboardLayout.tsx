import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Truck, Map, LogOut, LayoutDashboard, Crosshair, Settings, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/utils';

const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Live Map', href: '/map', icon: Map },
    { name: 'Vehicles', href: '/vehicles', icon: Truck },
    { name: 'Geofencing', href: '/geofencing', icon: Crosshair },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center space-x-2">
          <Truck className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">Smart Fleet</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
