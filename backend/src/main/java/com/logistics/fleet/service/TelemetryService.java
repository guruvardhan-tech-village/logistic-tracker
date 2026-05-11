package com.logistics.fleet.service;

import com.logistics.fleet.mapper.TelemetryMapper;
import com.logistics.fleet.model.dto.TelemetryDto;
import com.logistics.fleet.repository.TelemetryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final TelemetryMapper telemetryMapper;

    public List<TelemetryDto> getTelemetryHistory(Long vehicleId) {
        return telemetryRepository.findByVehicleIdOrderByTimestampDesc(vehicleId)
                .stream()
                .map(telemetryMapper::toDto)
                .collect(Collectors.toList());
    }
}
