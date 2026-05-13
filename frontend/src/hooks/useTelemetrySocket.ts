import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { useAlertStore } from '@/store/useAlertStore';

export interface TelemetryData {
  id: number;
  vehicleId: number;
  latitude: number;
  longitude: number;
  speed: number;
  fuelEfficiency?: number;
  fuelLevel?: number;
  timestamp: string;
}

export const useTelemetrySocket = () => {
  const [telemetryUpdates, setTelemetryUpdates] = useState<TelemetryData[]>([]);

  useEffect(() => {
    let brokerUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
    
    // Auto-correct http/https to ws/wss
    if (brokerUrl.startsWith('http://')) {
      brokerUrl = 'ws://' + brokerUrl.slice(7);
    } else if (brokerUrl.startsWith('https://')) {
      brokerUrl = 'wss://' + brokerUrl.slice(8);
    }
    
    // Ensure it ends with /ws
    if (brokerUrl.endsWith('/')) {
      brokerUrl = brokerUrl.slice(0, -1);
    }
    if (!brokerUrl.endsWith('/ws')) {
      brokerUrl += '/ws';
    }

    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        const addAlert = useAlertStore.getState().addAlert;

        client.subscribe('/topic/telemetry', (message) => {
          const data: TelemetryData = JSON.parse(message.body);
          
          if (data.speed > 90) {
            addAlert({
              message: `Speeding Alert: Vehicle #${data.vehicleId} exceeded 90 km/h (Current: ${data.speed.toFixed(1)} km/h).`,
              type: 'warning'
            });
          }

          setTelemetryUpdates((prev) => {
            // Keep the latest state per vehicle
            const filtered = prev.filter((t) => t.vehicleId !== data.vehicleId);
            return [...filtered, data];
          });
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  return { telemetryUpdates };
};
