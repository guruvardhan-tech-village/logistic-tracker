import { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';

export interface TelemetryData {
  id: number;
  vehicleId: number;
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: string;
}

export const useTelemetrySocket = () => {
  const [telemetryUpdates, setTelemetryUpdates] = useState<TelemetryData[]>([]);

  useEffect(() => {
    const brokerUrl = import.meta.env.VITE_WS_URL || `ws://${window.location.host}/ws`;
    const client = new Client({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe('/topic/telemetry', (message) => {
          const data: TelemetryData = JSON.parse(message.body);
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
