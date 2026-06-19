package com.example.leave.exception;

import com.example.leave.dto.LeaveDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<LeaveDTO.ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        log.error("Not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(LeaveDTO.ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(LeaveException.class)
    public ResponseEntity<LeaveDTO.ApiResponse<Void>> handleLeaveException(LeaveException ex) {
        log.error("Leave error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(LeaveDTO.ApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<LeaveDTO.ApiResponse<Map<String, String>>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String field = ((FieldError) error).getField();
            errors.put(field, error.getDefaultMessage());
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(LeaveDTO.ApiResponse.<Map<String, String>>builder()
                        .success(false).message("Validation failed").data(errors).build());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<LeaveDTO.ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LeaveDTO.ApiResponse.error("Invalid email or password"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<LeaveDTO.ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(LeaveDTO.ApiResponse.error("You don't have permission to perform this action"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<LeaveDTO.ApiResponse<Void>> handleGeneral(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(LeaveDTO.ApiResponse.error("An unexpected error occurred."));
    }
}