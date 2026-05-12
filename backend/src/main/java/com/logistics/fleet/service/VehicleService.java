package com.logistics.fleet.service;

import com.logistics.fleet.exception.VehicleNotFoundException;
import com.logistics.fleet.mapper.VehicleMapper;
import com.logistics.fleet.model.dto.VehicleDto;
import com.logistics.fleet.model.entity.Vehicle;
import com.logistics.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

    public VehicleDto createVehicle(VehicleDto vehicleDto) {
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDto);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDto(savedVehicle);
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with ID: " + id));
        return vehicleMapper.toDto(vehicle);
    }

    public VehicleDto getVehicleByPlateNumber(String plateNumber) {
        Vehicle vehicle = vehicleRepository.findByPlateNumber(plateNumber)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with Plate: " + plateNumber));
        return vehicleMapper.toDto(vehicle);
    }

    public List<VehicleDto> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<VehicleDto> getVehiclesByDriver(String driverName) {
        return vehicleRepository.findByDriverName(driverName).stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    public VehicleDto updateVehicle(Long id, VehicleDto vehicleDto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with ID: " + id));

        vehicleMapper.updateEntityFromDto(vehicleDto, vehicle);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        
        return vehicleMapper.toDto(updatedVehicle);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException("Vehicle not found with ID: " + id));
        vehicleRepository.delete(vehicle);
    }
}
