package com.example.leave.dto;

import com.example.leave.enums.LeaveStatus;
import com.example.leave.enums.LeaveType;
import com.example.leave.enums.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LeaveDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Login request")
    public static class LoginRequest {

        @Schema(
                description = "Employee email address",
                example = "john@example.com"
        )
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email")
        private String email;

        @Schema(
                description = "Employee password",
                example = "password123"
        )
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Authentication response")
    public static class AuthResponse {

        @Schema(example = "eyJhbGciOiJIUzI1NiJ9...")
        private String token;

        @Schema(example = "Bearer")
        private String type = "Bearer";

        @Schema(example = "1")
        private Long employeeId;

        @Schema(example = "John Doe")
        private String name;

        @Schema(example = "john@example.com")
        private String email;

        @Schema(example = "EMPLOYEE")
        private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Employee creation request")
    public static class CreateEmployeeRequest {

        @Schema(example = "John Doe")
        @NotBlank(message = "Name is required")
        private String name;

        @Schema(example = "john@example.com")
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email")
        private String email;

        @Schema(example = "password123")
        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        @Schema(example = "IT")
        private String department;

        @Schema(example = "Software Engineer")
        private String designation;

        @Schema(
                description = "Employee role",
                example = "EMPLOYEE"
        )
        @NotNull(message = "Role is required")
        private Role role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Employee details")
    public static class EmployeeResponse {

        @Schema(example = "1")
        private Long id;

        @Schema(example = "John Doe")
        private String name;

        @Schema(example = "john@example.com")
        private String email;

        @Schema(example = "IT")
        private String department;

        @Schema(example = "Software Engineer")
        private String designation;

        @Schema(example = "EMPLOYEE")
        private String role;

        @Schema(example = "20")
        private Integer annualBalance;

        @Schema(example = "10")
        private Integer sickBalance;

        @Schema(example = "5")
        private Integer casualBalance;

        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Leave application request")
    public static class ApplyLeaveRequest {

        @Schema(
                description = "Type of leave",
                example = "ANNUAL"
        )
        @NotNull(message = "Leave type is required")
        private LeaveType leaveType;

        @Schema(example = "2026-06-20")
        @NotNull(message = "Start date is required")
        @FutureOrPresent(message = "Start date cannot be in the past")
        private LocalDate startDate;

        @Schema(example = "2026-06-25")
        @NotNull(message = "End date is required")
        @Future(message = "End date must be in the future")
        private LocalDate endDate;

        @Schema(
                example = "Family vacation planned in advance"
        )
        @NotBlank(message = "Reason is required")
        @Size(
                min = 10,
                max = 500,
                message = "Reason must be between 10 and 500 characters"
        )
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Approve or reject leave request")
    public static class LeaveActionRequest {

        @Schema(
                description = "APPROVED or REJECTED",
                example = "APPROVED"
        )
        @NotNull(message = "Status is required")
        private LeaveStatus status;

        @Schema(
                example = "Insufficient leave balance"
        )
        @Size(max = 500)
        private String rejectionReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Leave request details")
    public static class LeaveResponse {

        @Schema(example = "101")
        private Long id;

        @Schema(example = "1")
        private Long employeeId;

        @Schema(example = "John Doe")
        private String employeeName;

        @Schema(example = "ANNUAL")
        private String leaveType;

        private LocalDate startDate;

        private LocalDate endDate;

        @Schema(example = "5")
        private Integer totalDays;

        @Schema(example = "Family vacation")
        private String reason;

        @Schema(example = "PENDING")
        private String status;

        @Schema(example = "Insufficient leave balance")
        private String rejectionReason;

        @Schema(example = "Manager User")
        private String approvedBy;

        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Standard API response wrapper")
    public static class ApiResponse<T> {

        @Schema(example = "true")
        private boolean success;

        @Schema(example = "Operation completed successfully")
        private String message;

        private T data;

        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder()
                    .success(true)
                    .message(message)
                    .data(data)
                    .build();
        }

        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder()
                    .success(false)
                    .message(message)
                    .build();
        }
    }
}
