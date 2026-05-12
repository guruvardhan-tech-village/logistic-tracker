import { Truck, Activity, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useTelemetrySocket } from '@/hooks/useTelemetrySocket';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DashboardHome = () => {
  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles');
      return data as any[];
    },
  });

  const { telemetryUpdates } = useTelemetrySocket();

  const activeVehicles = vehicles?.filter(v => v.status === 'ACTIVE').length || 0;
  const maintenanceVehicles = vehicles?.filter(v => v.status === 'MAINTENANCE').length || 0;
  const totalVehicles = vehicles?.length || 0;

  // Prepare data for the speed chart
  const chartData = vehicles?.map(v => {
    const telemetry = telemetryUpdates.find(t => t.vehicleId === v.id);
    return {
      name: v.plateNumber,
      speed: telemetry ? Math.round(telemetry.speed) : 0,
      status: v.status
    };
  }).sort((a, b) => b.speed - a.speed).slice(0, 10) || []; // Show top 10

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
      
      <div className="border rounded-xl bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Live Fleet Speed (km/h)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: '#222' }}
                contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="speed" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.speed > 80 ? '#ef4444' : entry.speed > 0 ? '#10b981' : '#374151'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
