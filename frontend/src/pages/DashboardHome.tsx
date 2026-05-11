import { Truck, Activity, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const DashboardHome = () => {
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data as any[];
    },
  });

  const activeVehicles = vehicles?.filter(v => v.status === 'ACTIVE').length || 0;
  const maintenanceVehicles = vehicles?.filter(v => v.status === 'MAINTENANCE').length || 0;
  const totalVehicles = vehicles?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to the Fleet Management System.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border bg-card text-card-foreground shadow-sm rounded-xl p-6 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
            <h2 className="text-3xl font-bold">{totalVehicles}</h2>
          </div>
        </div>

        <div className="border bg-card text-card-foreground shadow-sm rounded-xl p-6 flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <Activity className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active on Route</p>
            <h2 className="text-3xl font-bold">{activeVehicles}</h2>
          </div>
        </div>

        <div className="border bg-card text-card-foreground shadow-sm rounded-xl p-6 flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">In Maintenance</p>
            <h2 className="text-3xl font-bold">{maintenanceVehicles}</h2>
          </div>
        </div>
      </div>
      
      {/* Recharts can be added here for speed/fuel analytics as requested */}
      <div className="h-64 border rounded-xl bg-card flex items-center justify-center text-muted-foreground shadow-sm">
         [Analytics Chart Placeholder - Recharts]
      </div>
    </div>
  );
};

export default DashboardHome;
