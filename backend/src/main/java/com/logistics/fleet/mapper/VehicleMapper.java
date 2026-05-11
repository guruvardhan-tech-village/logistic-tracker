package com.logistics.fleet.mapper;

import com.logistics.fleet.model.dto.VehicleDto;
import com.logistics.fleet.model.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VehicleMapper {
    VehicleDto toDto(Vehicle vehicle);
    Vehicle toEntity(VehicleDto vehicleDto);
    void updateEntityFromDto(VehicleDto vehicleDto, @MappingTarget Vehicle vehicle);
}
