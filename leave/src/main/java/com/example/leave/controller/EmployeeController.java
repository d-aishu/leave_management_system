package com.example.leave.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.leave.dto.LeaveDTO;
import com.example.leave.service.EmployeeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee Management", description = "Employee management APIs")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(
            summary = "Create Employee",
            description = "Create a new employee account. Accessible only to ADMIN users."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Employee created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid employee data"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.EmployeeResponse>> createEmployee(
            @Valid @RequestBody LeaveDTO.CreateEmployeeRequest request) {

        LeaveDTO.EmployeeResponse employee = employeeService.createEmployee(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(LeaveDTO.ApiResponse.success("Employee created successfully", employee));
    }

    @Operation(
            summary = "Get All Employees",
            description = "Retrieve all employees. Accessible to MANAGER and ADMIN users."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employees fetched successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<LeaveDTO.ApiResponse<List<LeaveDTO.EmployeeResponse>>> getAllEmployees() {

        List<LeaveDTO.EmployeeResponse> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(
                LeaveDTO.ApiResponse.success("Employees fetched", employees)
        );
    }

    @Operation(
            summary = "Get My Profile",
            description = "Returns the profile details of the currently authenticated employee."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Profile fetched successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/me")
    public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.EmployeeResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        LeaveDTO.EmployeeResponse profile =
                employeeService.getMyProfile(userDetails.getUsername());

        return ResponseEntity.ok(
                LeaveDTO.ApiResponse.success("Profile fetched", profile)
        );
    }

    @Operation(
            summary = "Get Employee By ID",
            description = "Retrieve employee details using employee ID. Accessible to MANAGER and ADMIN users."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Employee fetched successfully"),
            @ApiResponse(responseCode = "404", description = "Employee not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
    public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.EmployeeResponse>> getEmployeeById(
            @PathVariable Long id) {

        LeaveDTO.EmployeeResponse employee =
                employeeService.getEmployeeById(id);

        return ResponseEntity.ok(
                LeaveDTO.ApiResponse.success("Employee fetched", employee)
        );
    }
}