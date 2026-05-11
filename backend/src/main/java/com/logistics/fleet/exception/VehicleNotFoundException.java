package com.logistics.fleet.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class VehicleNotFoundException extends ResourceNotFoundException {
    public VehicleNotFoundException(String message) {
        super(message);
    }
}
