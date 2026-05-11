package com.logistics.fleet.mapper;

import com.logistics.fleet.model.dto.TelemetryDto;
import com.logistics.fleet.model.entity.Telemetry;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TelemetryMapper {
    TelemetryDto toDto(Telemetry telemetry);
    Telemetry toEntity(TelemetryDto telemetryDto);
}
