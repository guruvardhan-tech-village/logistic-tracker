package com.logistics.fleet.config;

import com.logistics.fleet.model.entity.User;
import com.logistics.fleet.model.entity.Vehicle;
import com.logistics.fleet.repository.UserRepository;
import com.logistics.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role("ROLE_ADMIN")
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded admin user (username: admin, password: admin123)");

            User driver = User.builder()
                    .username("driver1")
                    .password(passwordEncoder.encode("driver123"))
                    .role("ROLE_DRIVER")
                    .build();
            userRepository.save(driver);
            System.out.println("Seeded driver user (username: driver1, password: driver123)");

            User customer = User.builder()
                    .username("customer1")
                    .password(passwordEncoder.encode("customer123"))
                    .role("ROLE_CUSTOMER")
                    .build();
            userRepository.save(customer);
            System.out.println("Seeded customer user (username: customer1, password: customer123)");

            if (vehicleRepository.count() == 0) {
                Vehicle v = Vehicle.builder()
                        .vin("VIN-DRIVER1-TEST")
                        .plateNumber("KA01D1111")
                        .status("ACTIVE")
                        .type("Truck")
                        .driverName("driver1")
                        .driverContact("+1 555-DRIVER")
                        .build();
                vehicleRepository.save(v);
                System.out.println("Seeded vehicle assigned to driver1");
            }
        }
    }
}
