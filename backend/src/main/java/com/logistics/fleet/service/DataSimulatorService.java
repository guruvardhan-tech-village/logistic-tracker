package com.logistics.fleet.service;

import com.logistics.fleet.model.dto.MqttTelemetryPayload;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@EnableScheduling
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.simulation.enabled", havingValue = "true", matchIfMissing = true)
public class DataSimulatorService {

    private final TelemetryService telemetryService;
    private final List<SimulatedVehicle> fleet = new ArrayList<>();
    private final Random random = new Random();

    private static final double START_LAT = 12.9716; // Bengaluru
    private static final double START_LNG = 77.5946;

    @PostConstruct
    public void init() {
        log.info("Initializing Internal Fleet Simulator with 10 vehicles...");

        // 4 Cars (speed: 60-100, efficiency: 15-18, capacity: 40-60)
        for (int i = 0; i < 4; i++) {
            fleet.add(new SimulatedVehicle(String.format("KA01NF%d", 5550 + i), "Car", 
                    randomOffset(), randomOffset(), 60, 100, 15, 18, 40, 60));
        }

        // 3 Buses (speed: 40-60, efficiency: 5-8, capacity: 200-300)
        for (int i = 0; i < 3; i++) {
            fleet.add(new SimulatedVehicle(String.format("MH12AB%d", 1230 + i), "Bus", 
                    randomOffset(), randomOffset(), 40, 60, 5, 8, 200, 300));
        }

        // 3 Trucks (speed: 20-40, efficiency: 3-5, capacity: 400-600)
        for (int i = 0; i < 3; i++) {
            fleet.add(new SimulatedVehicle(String.format("DL04TR%d", 8880 + i), "Truck", 
                    randomOffset(), randomOffset(), 20, 40, 3, 5, 400, 600));
        }
    }

    private double randomOffset() {
        return (random.nextDouble() * 0.03) - 0.015;
    }

    @Scheduled(fixedRate = 5000)
    public void simulateMovement() {
        for (SimulatedVehicle vehicle : fleet) {
            vehicle.updatePosition(5); // 5 seconds
            
            MqttTelemetryPayload payload = new MqttTelemetryPayload();
            payload.setVin(vehicle.getVin());
            payload.setType(vehicle.getType());
            payload.setLat(vehicle.getLat());
            payload.setLng(vehicle.getLng());
            payload.setSpeed(vehicle.getSpeed());
            payload.setFuelLevel(vehicle.getFuelLevel());
            payload.setFuelEfficiency(vehicle.getFuelEfficiency());
            payload.setFuelRange(vehicle.getFuelRange());
            payload.setTimestamp(System.currentTimeMillis());

            telemetryService.processTelemetry(payload);
        }
    }

    @Data
    private class SimulatedVehicle {
        private String vin;
        private String type;
        private double lat;
        private double lng;
        private double speed;
        private double fuelLevel;
        private double fuelEfficiency;
        private double fuelRange;
        private double heading;

        private double minSpeed, maxSpeed;

        public SimulatedVehicle(String vin, String type, double latOffset, double lngOffset,
                                double minSpeed, double maxSpeed, double minEff, double maxEff,
                                double minCap, double maxCap) {
            this.vin = vin;
            this.type = type;
            this.lat = START_LAT + latOffset;
            this.lng = START_LNG + lngOffset;
            this.minSpeed = minSpeed;
            this.maxSpeed = maxSpeed;

            this.speed = minSpeed + (maxSpeed - minSpeed) * random.nextDouble();
            this.fuelEfficiency = minEff + (maxEff - minEff) * random.nextDouble();
            
            double capacity = minCap + (maxCap - minCap) * random.nextDouble();
            this.fuelLevel = capacity * (0.5 + 0.5 * random.nextDouble());
            this.fuelRange = this.fuelLevel * this.fuelEfficiency;
            this.heading = random.nextDouble() * 360;
        }

        public void updatePosition(int deltaSeconds) {
            double distanceKm = speed * (deltaSeconds / 3600.0);
            
            double fuelConsumed = distanceKm / fuelEfficiency;
            fuelLevel = Math.max(0, fuelLevel - fuelConsumed);
            fuelRange = fuelLevel * fuelEfficiency;

            if (fuelLevel <= 0) {
                speed = 0;
                return;
            }

            double dx = distanceKm * Math.sin(Math.toRadians(heading));
            double dy = distanceKm * Math.cos(Math.toRadians(heading));

            lat += dy / 111.0;
            lng += dx / (111.0 * Math.cos(Math.toRadians(lat)));

            heading = (heading + (random.nextDouble() * 30 - 15)) % 360;
            speed = Math.max(minSpeed, Math.min(maxSpeed, speed + (random.nextDouble() * 10 - 5)));
        }
    }
}
