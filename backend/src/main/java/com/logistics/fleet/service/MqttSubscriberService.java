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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "mqtt.enabled", havingValue = "true")
public class MqttSubscriberService {

    private final MqttClient mqttClient;
    private final TelemetryService telemetryService;
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
                        
                        // Process the telemetry (save to DB and broadcast to WS)
                        telemetryService.processTelemetry(dto);
                        
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
