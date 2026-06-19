package com.example.leave.service;

import com.example.leave.dto.LeaveDTO;
import com.example.leave.entity.Employee;
import com.example.leave.exception.LeaveException;
import com.example.leave.exception.ResourceNotFoundException;
import com.example.leave.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public LeaveDTO.EmployeeResponse createEmployee(LeaveDTO.CreateEmployeeRequest request) {
        if (employeeRepository.existsByEmail(request.getEmail())) {
            throw new LeaveException("Employee with email " + request.getEmail() + " already exists");
        }

        Employee employee = Employee.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .role(request.getRole())
                .build();

        Employee saved = employeeRepository.save(employee);
        log.info("Created employee: {}", saved.getEmail());
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<LeaveDTO.EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeaveDTO.EmployeeResponse getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
        return mapToResponse(employee);
    }

    @Transactional(readOnly = true)
    public LeaveDTO.EmployeeResponse getMyProfile(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + email));
        return mapToResponse(employee);
    }

    @Transactional
    public void deductLeaveBalance(Long employeeId, String leaveType, int days) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        switch (leaveType) {
            case "ANNUAL" -> {
                if (employee.getAnnualBalance() < days)
                    throw new LeaveException("Insufficient annual leave balance");
                employee.setAnnualBalance(employee.getAnnualBalance() - days);
            }
            case "SICK" -> {
                if (employee.getSickBalance() < days)
                    throw new LeaveException("Insufficient sick leave balance");
                employee.setSickBalance(employee.getSickBalance() - days);
            }
            case "CASUAL" -> {
                if (employee.getCasualBalance() < days)
                    throw new LeaveException("Insufficient casual leave balance");
                employee.setCasualBalance(employee.getCasualBalance() - days);
            }
        }
        employeeRepository.save(employee);
    }

    @Transactional
    public void restoreLeaveBalance(Long employeeId, String leaveType, int days) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        switch (leaveType) {
            case "ANNUAL" -> employee.setAnnualBalance(employee.getAnnualBalance() + days);
            case "SICK"   -> employee.setSickBalance(employee.getSickBalance() + days);
            case "CASUAL" -> employee.setCasualBalance(employee.getCasualBalance() + days);
        }
        employeeRepository.save(employee);
    }

    public LeaveDTO.EmployeeResponse mapToResponse(Employee employee) {
        return LeaveDTO.EmployeeResponse.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .role(employee.getRole().name())
                .annualBalance(employee.getAnnualBalance())
                .sickBalance(employee.getSickBalance())
                .casualBalance(employee.getCasualBalance())
                .createdAt(employee.getCreatedAt())
                .build();
    }
}