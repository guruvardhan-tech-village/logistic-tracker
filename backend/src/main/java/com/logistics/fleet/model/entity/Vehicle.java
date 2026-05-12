package com.logistics.fleet.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String vin;

    @Column(unique = true, nullable = false)
    private String plateNumber;

    @Column(nullable = false)
    private String status; // e.g., ACTIVE, MAINTENANCE, INACTIVE

    @Column
    private String type; // e.g., 10 Wheeler, 18 Wheeler, Car, Bus

    @Column
    private String driverName;

    @Column
    private String driverContact;
}
