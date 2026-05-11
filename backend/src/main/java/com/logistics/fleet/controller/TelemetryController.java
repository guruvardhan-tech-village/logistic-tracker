package com.logistics.fleet.controller;

import com.logistics.fleet.model.dto.TelemetryDto;
import com.logistics.fleet.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Telemetry", description = "Telemetry data endpoints")
public class TelemetryController {

    private final TelemetryService telemetryService;

    @Operation(summary = "Get historical telemetry for a vehicle")
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<TelemetryDto>> getTelemetryHistory(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(telemetryService.getTelemetryHistory(vehicleId));
    }
}
