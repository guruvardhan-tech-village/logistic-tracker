import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Truck, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';

interface Vehicle {
  id: number;
  vin: string;
  plateNumber: string;
  status: string;
}

const fetchVehicles = async (): Promise<Vehicle[]> => {
  const { data } = await api.get('/vehicles');
  return data;
};

const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      colorClass = 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      break;
    case 'IDLE':
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      break;
    case 'MAINTENANCE':
      colorClass = 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      break;
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {status}
    </span>
  );
};

const VehicleList = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ROLE_ADMIN';
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ vin: '', plateNumber: '', status: 'ACTIVE' });

  const { data: vehicles, isLoading, isError } = useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehicles,
  });

  const addMutation = useMutation({
    mutationFn: (vehicle: Omit<Vehicle, 'id'>) => api.post('/vehicles', vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowAddForm(false);
      setNewVehicle({ vin: '', plateNumber: '', status: 'ACTIVE' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(newVehicle);
  };

  if (isLoading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (isError) return <div className="p-8 text-destructive">Failed to load vehicles.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
        {isAdmin && (
          <Button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vehicle
          </Button>
        )}
      </div>

      {showAddForm && isAdmin && (
        <div className="p-6 border rounded-md shadow-sm bg-card mb-6">
          <h2 className="text-lg font-semibold mb-4">Add New Vehicle</h2>
          <form onSubmit={handleAddSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Plate Number</label>
              <input 
                required
                type="text" 
                placeholder="e.g. KA01NF5555"
                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newVehicle.plateNumber}
                onChange={(e) => setNewVehicle({...newVehicle, plateNumber: e.target.value, vin: e.target.value})}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select 
                className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newVehicle.status}
                onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="IDLE">IDLE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
            <Button type="submit" disabled={addMutation.isPending}>Save</Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </form>
        </div>
      )}

      <div className="border rounded-md shadow-sm bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Vehicle ID</th>
              <th className="px-6 py-4 font-medium">Plate Number</th>
              <th className="px-6 py-4 font-medium">Status</th>
              {isAdmin && <th className="px-6 py-4 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vehicles?.map((vehicle) => (
              <tr key={vehicle.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 font-medium flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-muted-foreground" />
                  <span>#{vehicle.id}</span>
                </td>
                <td className="px-6 py-4 font-mono font-bold">{vehicle.plateNumber}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={vehicle.status} />
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete vehicle ${vehicle.plateNumber}?`)) {
                          deleteMutation.mutate(vehicle.id);
                        }
                      }}
                      className="text-destructive hover:text-red-700 transition-colors"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {vehicles?.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-muted-foreground">
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VehicleList;
