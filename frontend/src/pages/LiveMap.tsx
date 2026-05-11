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

const LiveMap = () => {
  const { telemetryUpdates } = useTelemetrySocket();

  // Default center (e.g., somewhere central)
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Map</h1>
          <p className="text-muted-foreground">Real-time vehicle tracking via STOMP WebSockets.</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          {telemetryUpdates.length} Active Vehicles
        </div>
      </div>

      <div className="flex-1 min-h-[600px] border rounded-md overflow-hidden shadow-sm relative z-0">
        <MapContainer center={defaultCenter} zoom={12} className="absolute inset-0 w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {telemetryUpdates.map((update) => (
            <Marker key={update.vehicleId} position={[update.latitude, update.longitude]}>
              <Popup>
                <div className="font-semibold">Vehicle #{update.vehicleId}</div>
                <div className="text-sm">Speed: {update.speed} km/h</div>
                <div className="text-xs text-gray-500">{new Date(update.timestamp).toLocaleTimeString()}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
