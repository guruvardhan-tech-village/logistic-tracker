import { useState, useRef, useEffect } from 'react';
import { Bell, Trash2, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useAlertStore } from '@/store/useAlertStore';
import { cn } from '@/utils';

export const AlertsPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { alerts, markAsRead, clearAll } = useAlertStore();
  const unreadCount = alerts.filter(a => !a.read).length;
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full bg-card border shadow-sm hover:bg-accent relative transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-card">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
          <div className="p-3 border-b flex justify-between items-center bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {alerts.length > 0 && (
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                <Bell className="w-8 h-8 opacity-20" />
                No new alerts
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={cn(
                    "p-4 border-b last:border-0 text-sm hover:bg-muted/50 transition-colors flex gap-3 items-start cursor-pointer",
                    !alert.read ? "bg-muted/10" : "opacity-70"
                  )}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="mt-0.5 shrink-0">
                    {alert.type === 'warning' ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> :
                     alert.type === 'error' ? <XCircle className="w-4 h-4 text-red-500" /> :
                     <Info className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("font-medium leading-tight mb-1", !alert.read && "text-foreground font-semibold")}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {!alert.read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
