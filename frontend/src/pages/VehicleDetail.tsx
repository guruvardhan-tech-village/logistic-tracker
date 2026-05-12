import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useTelemetrySocket } from '@/hooks/useTelemetrySocket';
import type { TelemetryData } from '@/hooks/useTelemetrySocket';
import { Truck, MapPin, Gauge, Fuel, User, Phone, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Vehicle {
  id: number;
  vin: string;
  plateNumber: string;
  status: string;
  type?: string;
  driverName?: string;
  driverContact?: string;
}

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);
  const { telemetryUpdates } = useTelemetrySocket();
  
  const [history, setHistory] = useState<TelemetryData[]>([]);

  // Fetch Vehicle Info
  const { data: vehicle, isLoading: isVehicleLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const { data } = await api.get<Vehicle>(`/vehicles/${vehicleId}`);
      return data;
    },
    enabled: !!vehicleId
  });

  // Fetch Telemetry History
  const { data: initialHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['telemetryHistory', vehicleId],
    queryFn: async () => {
      const { data } = await api.get<TelemetryData[]>(`/telemetry/vehicle/${vehicleId}`);
      return data;
    },
    enabled: !!vehicleId
  });

  // Initialize history when fetched
  useEffect(() => {
    if (initialHistory) {
      // Sort by timestamp ascending for the charts
      const sorted = [...initialHistory].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setHistory(sorted);
    }
  }, [initialHistory]);

  // Update history with live updates
  useEffect(() => {
    const liveUpdate = telemetryUpdates.find(t => t.vehicleId === vehicleId);
    if (liveUpdate) {
      setHistory(prev => {
        // Only add if it's newer than the last point
        const lastTime = prev.length > 0 ? new Date(prev[prev.length - 1].timestamp).getTime() : 0;
        if (new Date(liveUpdate.timestamp).getTime() > lastTime) {
          // Keep last 50 data points for performance
          const newHistory = [...prev, liveUpdate];
          if (newHistory.length > 50) return newHistory.slice(newHistory.length - 50);
          return newHistory;
        }
        return prev;
      });
    }
  }, [telemetryUpdates, vehicleId]);

  if (isVehicleLoading || isHistoryLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  if (!vehicle) {
    return <div className="p-8 text-destructive">Vehicle not found.</div>;
  }

  const latestTelemetry = history.length > 0 ? history[history.length - 1] : null;
  const mapCenter: [number, number] = latestTelemetry ? [latestTelemetry.latitude, latestTelemetry.longitude] : [40.7128, -74.0060];

  const chartData = history.map(t => ({
    time: new Date(t.timestamp).toLocaleTimeString(),
    speed: t.speed,
    fuel: t.fuelEfficiency || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/vehicles" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="w-8 h-8 text-primary" />
            {vehicle.plateNumber}
          </h1>
          <p className="text-muted-foreground flex gap-4 mt-1">
            <span>VIN: {vehicle.vin}</span>
            <span>Type: {vehicle.type || 'Unknown'}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 border rounded-md shadow-sm bg-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold border-b pb-2">Driver Details</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{vehicle.driverName || 'Unassigned'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="w-3 h-3" /> {vehicle.driverContact || 'N/A'}
              </p>
            </div>
          </div>
          
          <h2 className="text-lg font-semibold border-b pb-2 mt-4">Current Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Gauge className="w-3 h-3"/> Speed</p>
              <p className="font-bold text-lg">{latestTelemetry ? `${latestTelemetry.speed.toFixed(1)} km/h` : '--'}</p>
            </div>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Fuel className="w-3 h-3"/> Fuel Efficiency</p>
              <p className="font-bold text-lg">{latestTelemetry?.fuelEfficiency ? `${latestTelemetry.fuelEfficiency.toFixed(2)} km/l` : '--'}</p>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="col-span-1 md:col-span-2 border rounded-md shadow-sm overflow-hidden h-[300px] relative z-0 bg-muted">
          {latestTelemetry ? (
            <MapContainer center={mapCenter} zoom={15} className="w-full h-full">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[latestTelemetry.latitude, latestTelemetry.longitude]}>
                <Popup>
                  <div className="font-semibold">{vehicle.plateNumber}</div>
                  <div>Speed: {latestTelemetry.speed.toFixed(1)} km/h</div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <MapPin className="w-8 h-8 mb-2 opacity-50" />
              <p>No location data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-md shadow-sm bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-500" /> Speed History
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" textAnchor="end" tick={{fontSize: 10}} height={40} />
                <YAxis dataKey="speed" tick={{fontSize: 12}} />
                <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}}/>
                <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border rounded-md shadow-sm bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-green-500" /> Fuel Efficiency History
          </h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" textAnchor="end" tick={{fontSize: 10}} height={40} />
                <YAxis dataKey="fuel" tick={{fontSize: 12}} />
                <RechartsTooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))'}}/>
                <Line type="monotone" dataKey="fuel" stroke="#22c55e" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
