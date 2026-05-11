import { useState } from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';

const GeofencingInteraction = ({ 
  onSetBoundary 
}: { 
  onSetBoundary: (center: [number, number], radius: number) => void 
}) => {
  const [startPoint, setStartPoint] = useState<L.LatLng | null>(null);
  const [currentPoint, setCurrentPoint] = useState<L.LatLng | null>(null);

  useMapEvents({
    mousedown(e) {
      setStartPoint(e.latlng);
      setCurrentPoint(e.latlng);
    },
    mousemove(e) {
      if (startPoint) {
        setCurrentPoint(e.latlng);
      }
    },
    mouseup() {
      if (startPoint && currentPoint) {
        const radius = startPoint.distanceTo(currentPoint); // radius in meters
        if (radius > 10) { // minimum 10 meters to avoid clicks registering as circles
          onSetBoundary([startPoint.lat, startPoint.lng], radius);
        }
      }
      setStartPoint(null);
      setCurrentPoint(null);
    }
  });

  return (
    <>
      {startPoint && currentPoint && (
        <Circle 
          center={[startPoint.lat, startPoint.lng]} 
          radius={startPoint.distanceTo(currentPoint)} 
          pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.2 }}
        />
      )}
    </>
  );
};

const GeofencingView = () => {
  const [geofence, setGeofence] = useState<{center: [number, number], radius: number} | null>(null);
  const defaultCenter: [number, number] = [40.7128, -74.0060];

  const handleSave = () => {
    // Here you would post this to the backend
    console.log("Saving geofence:", geofence);
    alert(`Geofence saved! Center: ${geofence?.center[0].toFixed(4)}, ${geofence?.center[1].toFixed(4)} | Radius: ${(geofence?.radius || 0).toFixed(0)}m`);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Geofencing Setup</h1>
        <p className="text-muted-foreground">Click and drag on the map to draw a circular geofence boundary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1">
        <div className="md:col-span-3 border rounded-md overflow-hidden shadow-sm relative z-0 min-h-[500px]">
          <MapContainer center={defaultCenter} zoom={12} className="absolute inset-0 w-full h-full" dragging={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeofencingInteraction onSetBoundary={(center, radius) => setGeofence({center, radius})} />
            
            {/* Show finalized geofence if one exists and we aren't currently drawing */}
            {geofence && (
              <Circle 
                center={geofence.center} 
                radius={geofence.radius} 
                pathOptions={{ color: 'hsl(var(--primary))', fillColor: 'hsl(var(--primary))', fillOpacity: 0.4 }}
              />
            )}
          </MapContainer>
        </div>

        <div className="bg-card border rounded-md p-6 space-y-6 h-fit shadow-sm">
          <div>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Boundary Details</h3>
            {geofence ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block">Latitude</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{geofence.center[0].toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Longitude</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{geofence.center[1].toFixed(6)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Radius (Meters)</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{geofence.radius.toFixed(2)}m</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No boundary drawn yet. Click and drag on the map.</p>
            )}
          </div>
          
          <Button 
            className="w-full" 
            disabled={!geofence}
            onClick={handleSave}
          >
            Save Geofence
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeofencingView;
