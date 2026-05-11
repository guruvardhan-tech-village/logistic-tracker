package com.logistics.fleet.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MqttTelemetryPayload {
    private String vin;
    private String type;
    private Double lat;
    private Double lng;
    private Double speed;
    private Double fuelLevel;
    private Double fuelEfficiency;
    private Double fuelRange;
    private Long timestamp;
}
