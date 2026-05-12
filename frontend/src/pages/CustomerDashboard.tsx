import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Search, MapPin, Truck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTelemetrySocket } from '@/hooks/useTelemetrySocket';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CustomerDashboard = () => {
  const [searchInput, setSearchInput] = useState('KA01D1111');
  const [trackedPlate, setTrackedPlate] = useState<string | null>(null);

  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', trackedPlate],
    queryFn: async () => {
      const { data } = await api.get(`/vehicles/plate/${trackedPlate}`);
      return data;
    },
    enabled: !!trackedPlate,
    retry: false
  });

  const { telemetryUpdates } = useTelemetrySocket();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setTrackedPlate(searchInput.trim());
    }
  };

  // Find telemetry for this specific vehicle if available
  const vehicleTelemetry = vehicle 
    ? telemetryUpdates.find(t => t.vehicleId === vehicle.id) 
    : null;

  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Track Your Delivery</h1>
          <p className="text-muted-foreground">Enter your vehicle plate number to see live status.</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="e.g. KA01D1111"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={!searchInput.trim() || isLoading}>
            {isLoading ? 'Searching...' : 'Track'}
          </Button>
        </form>
      </div>

      {isError && (
        <div className="p-4 border rounded-md bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-5 h-5" />
          <span>Vehicle with plate number "{trackedPlate}" not found.</span>
        </div>
      )}

      {vehicle && !isError && (
        <div className="flex-1 border rounded-md shadow-sm bg-card overflow-hidden flex flex-col md:flex-row z-0 relative">
          
          <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r flex flex-col gap-6 bg-card z-10 shrink-0">
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-3">
                {vehicle.status}
              </div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Truck className="w-6 h-6" /> 
                {vehicle.plateNumber}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Vehicle Type: {vehicle.type || 'Standard'}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">Current Location</div>
                  {vehicleTelemetry ? (
                    <div className="text-sm text-muted-foreground">
                      Lat: {vehicleTelemetry.latitude.toFixed(4)}<br/>
                      Lng: {vehicleTelemetry.longitude.toFixed(4)}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Location updating...</div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
                <div>
                  <div className="font-medium">Speed</div>
                  {vehicleTelemetry ? (
                    <div className="text-sm text-muted-foreground">
                      {vehicleTelemetry.speed.toFixed(1)} km/h
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">--</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t text-xs text-muted-foreground text-center">
              Last updated: {vehicleTelemetry ? new Date(vehicleTelemetry.timestamp).toLocaleTimeString() : 'Waiting for telemetry...'}
            </div>
          </div>

          <div className="flex-1 relative min-h-[400px]">
            <MapContainer 
              center={vehicleTelemetry ? [vehicleTelemetry.latitude, vehicleTelemetry.longitude] : defaultCenter} 
              zoom={13} 
              className="absolute inset-0 w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {vehicleTelemetry && (
                <Marker position={[vehicleTelemetry.latitude, vehicleTelemetry.longitude]}>
                  <Popup>
                    <div className="font-semibold">{vehicle.plateNumber}</div>
                    <div className="text-sm">Speed: {vehicleTelemetry.speed} km/h</div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      {!vehicle && !isError && !isLoading && (
        <div className="flex-1 border rounded-md border-dashed flex items-center justify-center text-muted-foreground flex-col gap-2 shrink-0">
          <Search className="w-10 h-10 opacity-20" />
          <p>Enter a vehicle plate number to begin tracking</p>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
