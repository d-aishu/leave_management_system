package com.example.leave.service;

import com.example.leave.config.JwtUtils;
import com.example.leave.dto.LeaveDTO;
import com.example.leave.entity.Employee;
import com.example.leave.exception.LeaveException;
import com.example.leave.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final EmployeeRepository employeeRepository;

    public LeaveDTO.AuthResponse login(LeaveDTO.LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtils.generateToken(userDetails);

        Employee employee = employeeRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new LeaveException("Employee not found"));

        log.info("User logged in: {}", request.getEmail());

        return LeaveDTO.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .employeeId(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .role(employee.getRole().name())
                .build();
    }
}