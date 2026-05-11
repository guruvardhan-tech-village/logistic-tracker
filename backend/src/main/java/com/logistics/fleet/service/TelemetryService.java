package com.logistics.fleet.service;

import com.logistics.fleet.mapper.TelemetryMapper;
import com.logistics.fleet.model.dto.MqttTelemetryPayload;
import com.logistics.fleet.model.dto.TelemetryDto;
import com.logistics.fleet.model.entity.Telemetry;
import com.logistics.fleet.model.entity.Vehicle;
import com.logistics.fleet.repository.TelemetryRepository;
import com.logistics.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final VehicleRepository vehicleRepository;
    private final TelemetryMapper telemetryMapper;
    private final SimpMessagingTemplate messagingTemplate;

    public List<TelemetryDto> getTelemetryHistory(Long vehicleId) {
        return telemetryRepository.findByVehicleIdOrderByTimestampDesc(vehicleId)
                .stream()
                .map(telemetryMapper::toDto)
                .collect(Collectors.toList());
    }

    public void processTelemetry(MqttTelemetryPayload dto) {
        try {
            // Auto-register vehicle if it doesn't exist
            Vehicle vehicle = vehicleRepository.findByVin(dto.getVin()).orElseGet(() -> {
                Vehicle newVehicle = Vehicle.builder()
                        .vin(dto.getVin())
                        .plateNumber(dto.getVin())
                        .status("ACTIVE")
                        .build();
                return vehicleRepository.save(newVehicle);
            });
            
            // Save Telemetry to Database
            Telemetry telemetry = Telemetry.builder()
                    .vehicleId(vehicle.getId())
                    .latitude(dto.getLat())
                    .longitude(dto.getLng())
                    .speed(dto.getSpeed())
                    .timestamp(dto.getTimestamp() != null ? Instant.ofEpochMilli(dto.getTimestamp()) : Instant.now())
                    .build();
            
            Telemetry saved = telemetryRepository.save(telemetry);
            
            // Broadcast via WebSocket to frontend using TelemetryDto
            TelemetryDto broadcastDto = TelemetryDto.builder()
                    .id(saved.getId())
                    .vehicleId(saved.getVehicleId())
                    .latitude(saved.getLatitude())
                    .longitude(saved.getLongitude())
                    .speed(saved.getSpeed())
                    .timestamp(saved.getTimestamp())
                    .build();
                    
            messagingTemplate.convertAndSend("/topic/telemetry", broadcastDto);
            
        } catch (Exception e) {
            log.error("Failed to process telemetry payload: {}", e.getMessage());
            e.printStackTrace();
        }
    }
}
