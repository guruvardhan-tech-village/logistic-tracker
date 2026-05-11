package com.logistics.fleet.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.logistics.fleet.model.dto.MqttTelemetryPayload;
import com.logistics.fleet.model.dto.TelemetryDto;
import com.logistics.fleet.model.entity.Telemetry;
import com.logistics.fleet.model.entity.Vehicle;
import com.logistics.fleet.repository.TelemetryRepository;
import com.logistics.fleet.repository.VehicleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttSubscriberService {

    private final MqttClient mqttClient;
    private final TelemetryRepository telemetryRepository;
    private final VehicleRepository vehicleRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${mqtt.topic.telemetry}")
    private String telemetryTopic;

    @PostConstruct
    public void subscribe() {
        try {
            mqttClient.subscribe(telemetryTopic, new IMqttMessageListener() {
                @Override
                public void messageArrived(String topic, MqttMessage message) throws Exception {
                    String payload = new String(message.getPayload());
                    log.info("Received MQTT message on topic {}: {}", topic, payload);
                    
                    try {
                        // Parse JSON payload using the new mapping
                        MqttTelemetryPayload dto = objectMapper.readValue(payload, MqttTelemetryPayload.class);
                        
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
                        log.error("Failed to process MQTT message: {}", e.getMessage());
                        e.printStackTrace();
                    }
                }
            });
            log.info("Subscribed to MQTT topic: {}", telemetryTopic);
        } catch (MqttException e) {
            log.error("Failed to subscribe to MQTT topic: {}", telemetryTopic, e);
        }
    }
}
