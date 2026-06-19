package com.example.leave.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.leave.dto.LeaveDTO;
import com.example.leave.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Login User",
            description = "Authenticate employee using email and password and generate JWT token"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid credentials"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @PostMapping("/login")
    public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.AuthResponse>> login(
            @Valid @RequestBody LeaveDTO.LoginRequest request) {

        LeaveDTO.AuthResponse authResponse = authService.login(request);
        return ResponseEntity.ok(
                LeaveDTO.ApiResponse.success(
                        "Login successful",
                        authResponse
                )
        );
    }
}