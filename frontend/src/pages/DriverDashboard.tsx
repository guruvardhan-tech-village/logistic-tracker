import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fetchMyVehicles = async () => {
  const { data } = await api.get('/vehicles/me');
  return data;
};

const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  if (status === 'ACTIVE') colorClass = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
  if (status === 'IDLE') colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
  if (status === 'MAINTENANCE') colorClass = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
  
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>{status}</span>;
};

const DriverDashboard = () => {
  const queryClient = useQueryClient();
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: fetchMyVehicles,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, vehicle }: { id: number, status: string, vehicle: any }) => 
      api.put(`/vehicles/${id}`, { ...vehicle, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">My Assigned Vehicles</h1>
      
      {vehicles?.length === 0 ? (
        <div className="p-8 border rounded-md bg-card text-center text-muted-foreground shadow-sm">
          No vehicles are currently assigned to you. Contact your dispatcher.
        </div>
      ) : (
        vehicles?.map((vehicle: any) => (
          <div key={vehicle.id} className="border rounded-md shadow-sm bg-card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Truck className="w-6 h-6 text-primary" /> 
                  {vehicle.plateNumber}
                </h2>
                <p className="text-muted-foreground mt-1">VIN: {vehicle.vin} | Type: {vehicle.type || 'Standard'}</p>
              </div>
              <StatusBadge status={vehicle.status} />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium text-lg text-foreground">Update Current Status</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant={vehicle.status === 'ACTIVE' ? 'default' : 'outline'}
                  onClick={() => updateStatusMutation.mutate({ id: vehicle.id, status: 'ACTIVE', vehicle })}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  Active / In Transit
                </Button>
                <Button 
                  variant={vehicle.status === 'IDLE' ? 'default' : 'outline'}
                  onClick={() => updateStatusMutation.mutate({ id: vehicle.id, status: 'IDLE', vehicle })}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  Idle / On Break
                </Button>
                <Button 
                  variant={vehicle.status === 'MAINTENANCE' ? 'default' : 'outline'}
                  onClick={() => updateStatusMutation.mutate({ id: vehicle.id, status: 'MAINTENANCE', vehicle })}
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 sm:flex-none"
                >
                  Issue / Maintenance
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DriverDashboard;
