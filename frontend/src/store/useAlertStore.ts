import { create } from 'zustand';

export interface Alert {
  id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'warning' | 'error' | 'info';
}

interface AlertState {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  addAlert: (alert) => set((state) => {
    // Avoid spamming the exact same alert message within a 15-second window
    const recentDuplicate = state.alerts.find(
      a => a.message === alert.message && (Date.now() - a.timestamp.getTime() < 15000)
    );
    if (recentDuplicate) return state;

    return {
      alerts: [{
        ...alert,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        read: false
      }, ...state.alerts].slice(0, 50) // keep only the last 50 alerts
    };
  }),
  markAsRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
  })),
  clearAll: () => set({ alerts: [] })
}));
