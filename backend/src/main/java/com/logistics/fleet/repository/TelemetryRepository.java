package com.logistics.fleet.repository;

import com.logistics.fleet.model.entity.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelemetryRepository extends JpaRepository<Telemetry, Long> {
    List<Telemetry> findByVehicleIdOrderByTimestampDesc(Long vehicleId);
}
