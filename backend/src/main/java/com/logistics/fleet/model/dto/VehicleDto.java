package com.logistics.fleet.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDto {
    private Long id;

    @NotBlank(message = "VIN cannot be blank")
    private String vin;

    @NotBlank(message = "Plate Number cannot be blank")
    private String plateNumber;

    @NotBlank(message = "Status cannot be blank")
    private String status;
}
