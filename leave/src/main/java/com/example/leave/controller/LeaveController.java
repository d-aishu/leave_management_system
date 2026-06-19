package com.example.leave.controller;

import com.example.leave.dto.LeaveDTO;
import com.example.leave.enums.LeaveStatus;
import com.example.leave.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
@RequiredArgsConstructor
@Tag(
name = "Leave Management",
description = "Leave application and approval APIs"
)
public class LeaveController {
    
private final LeaveService leaveService;

@Operation(
        summary = "Apply Leave",
        description = "Employee submits a new leave application"
)
@ApiResponses({
        @ApiResponse(responseCode = "201", description = "Leave application submitted"),
        @ApiResponse(responseCode = "400", description = "Invalid leave request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
})
@PostMapping
public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.LeaveResponse>> applyLeave(
        @Valid @RequestBody LeaveDTO.ApplyLeaveRequest request,
        @AuthenticationPrincipal UserDetails userDetails) {

    LeaveDTO.LeaveResponse response =
            leaveService.applyLeave(userDetails.getUsername(), request);

    return ResponseEntity.status(HttpStatus.CREATED)
            .body(LeaveDTO.ApiResponse.success(
                    "Leave application submitted",
                    response
            ));
}

@Operation(
        summary = "Get My Leaves",
        description = "Returns leave history of currently logged-in employee. Can optionally filter by status."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Leaves fetched successfully"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
})
@GetMapping("/my")
public ResponseEntity<LeaveDTO.ApiResponse<List<LeaveDTO.LeaveResponse>>> getMyLeaves(
        @RequestParam(required = false) LeaveStatus status,
        @AuthenticationPrincipal UserDetails userDetails) {

    List<LeaveDTO.LeaveResponse> leaves =
            leaveService.getMyLeaves(userDetails.getUsername(), status);

    return ResponseEntity.ok(
            LeaveDTO.ApiResponse.success(
                    "Leaves fetched",
                    leaves
            )
    );
}

@Operation(
        summary = "Get All Leave Requests",
        description = "Returns all leave requests. Accessible to MANAGER and ADMIN users."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Leave requests fetched successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
})
@GetMapping
@PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
public ResponseEntity<LeaveDTO.ApiResponse<List<LeaveDTO.LeaveResponse>>> getAllLeaves(
        @RequestParam(required = false) LeaveStatus status) {

    List<LeaveDTO.LeaveResponse> leaves =
            leaveService.getAllLeaves(status);

    return ResponseEntity.ok(
            LeaveDTO.ApiResponse.success(
                    "All leaves fetched",
                    leaves
            )
    );
}

@Operation(
        summary = "Get Leave By ID",
        description = "Returns details of a specific leave request."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Leave fetched successfully"),
        @ApiResponse(responseCode = "404", description = "Leave not found")
})
@GetMapping("/{id}")
public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.LeaveResponse>> getLeaveById(
        @PathVariable Long id) {

    LeaveDTO.LeaveResponse leave =
            leaveService.getLeaveById(id);

    return ResponseEntity.ok(
            LeaveDTO.ApiResponse.success(
                    "Leave fetched",
                    leave
            )
    );
}

@Operation(
        summary = "Approve Or Reject Leave",
        description = "Manager or Admin approves or rejects a leave request."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Leave request processed successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Leave not found")
})
@PutMapping("/{id}/action")
@PreAuthorize("hasAnyAuthority('ROLE_MANAGER', 'ROLE_ADMIN')")
public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.LeaveResponse>> processLeave(
        @PathVariable Long id,
        @Valid @RequestBody LeaveDTO.LeaveActionRequest actionRequest,
        @AuthenticationPrincipal UserDetails userDetails) {

    LeaveDTO.LeaveResponse response =
            leaveService.processLeaveAction(
                    id,
                    actionRequest,
                    userDetails.getUsername()
            );

    return ResponseEntity.ok(
            LeaveDTO.ApiResponse.success(
                    "Leave " +
                            actionRequest.getStatus()
                                    .name()
                                    .toLowerCase(),
                    response
            )
    );
}

@Operation(
        summary = "Cancel Leave",
        description = "Employee cancels an existing leave request."
)
@ApiResponses({
        @ApiResponse(responseCode = "200", description = "Leave cancelled successfully"),
        @ApiResponse(responseCode = "400", description = "Leave cannot be cancelled"),
        @ApiResponse(responseCode = "404", description = "Leave not found")
})
@PutMapping("/{id}/cancel")
public ResponseEntity<LeaveDTO.ApiResponse<LeaveDTO.LeaveResponse>> cancelLeave(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails) {

    LeaveDTO.LeaveResponse response =
            leaveService.cancelLeave(
                    id,
                    userDetails.getUsername()
            );

    return ResponseEntity.ok(
            LeaveDTO.ApiResponse.success(
                    "Leave cancelled",
                    response
            )
    );
}

}
