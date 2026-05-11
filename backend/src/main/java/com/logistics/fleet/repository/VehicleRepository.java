package com.logistics.fleet.repository;

import com.logistics.fleet.model.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVin(String vin);
    Optional<Vehicle> findByPlateNumber(String plateNumber);
}
