package com.example.leave.config;

import com.example.leave.entity.Employee;
import com.example.leave.enums.Role;
import com.example.leave.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedAdmin();
        seedSampleEmployees();
    }

    private void seedAdmin() {
        if (employeeRepository.existsByEmail("admin@company.com")) return;

        employeeRepository.save(Employee.builder()
                .name("System Admin")
                .email("admin@company.com")
                .password(passwordEncoder.encode("admin123"))
                .department("IT")
                .designation("System Administrator")
                .role(Role.ROLE_ADMIN)
                .build());
        log.info("Admin created: admin@company.com / admin123");
    }

    private void seedSampleEmployees() {
        if (!employeeRepository.existsByEmail("manager@company.com")) {
            employeeRepository.save(Employee.builder()
                    .name("Ravi Kumar")
                    .email("manager@company.com")
                    .password(passwordEncoder.encode("manager123"))
                    .department("Engineering")
                    .designation("Engineering Manager")
                    .role(Role.ROLE_MANAGER)
                    .build());
            log.info("Manager created: manager@company.com / manager123");
        }

        if (!employeeRepository.existsByEmail("employee@company.com")) {
            employeeRepository.save(Employee.builder()
                    .name("Priya Sharma")
                    .email("employee@company.com")
                    .password(passwordEncoder.encode("emp123"))
                    .department("Engineering")
                    .designation("Software Developer")
                    .role(Role.ROLE_EMPLOYEE)
                    .build());
            log.info("Employee created: employee@company.com / emp123");
        }
    }
}