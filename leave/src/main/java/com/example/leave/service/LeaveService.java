package com.example.leave.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.leave.dto.LeaveDTO;
import com.example.leave.entity.Employee;
import com.example.leave.entity.LeaveRequest;
import com.example.leave.enums.LeaveStatus;
import com.example.leave.enums.LeaveType;
import com.example.leave.exception.LeaveException;
import com.example.leave.exception.ResourceNotFoundException;
import com.example.leave.repository.EmployeeRepository;
import com.example.leave.repository.LeaveRequestRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final EmployeeService employeeService;

    @Transactional
    public LeaveDTO.LeaveResponse applyLeave(String employeeEmail, LeaveDTO.ApplyLeaveRequest request) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new LeaveException("End date must be on or after start date");
        }

        List<LeaveRequest> overlapping = leaveRequestRepository.findOverlappingLeaves(
                employee.getId(), request.getStartDate(), request.getEndDate());
        if (!overlapping.isEmpty()) {
            throw new LeaveException("You already have a leave request for these dates");
        }

        int totalDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());
        checkLeaveBalance(employee, request.getLeaveType(), totalDays);

        LeaveRequest leaveRequest = LeaveRequest.builder()
                .employee(employee)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .reason(request.getReason())
                .status(LeaveStatus.PENDING)
                .build();

        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        log.info("Leave applied by {} for {} days", employeeEmail, totalDays);
        return mapToResponse(saved);
    }

    @Transactional
    public LeaveDTO.LeaveResponse processLeaveAction(Long leaveId,
                                                      LeaveDTO.LeaveActionRequest actionRequest,
                                                      String managerEmail) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Request", leaveId));

        if (leaveRequest.getStatus() != LeaveStatus.PENDING) {
            throw new LeaveException("Only PENDING leave requests can be approved or rejected. Current: "
                    + leaveRequest.getStatus());
        }

        if (actionRequest.getStatus() == LeaveStatus.REJECTED &&
            (actionRequest.getRejectionReason() == null || actionRequest.getRejectionReason().isBlank())) {
            throw new LeaveException("Rejection reason is required");
        }

        leaveRequest.setStatus(actionRequest.getStatus());
        leaveRequest.setApprovedBy(managerEmail);

        if (actionRequest.getStatus() == LeaveStatus.APPROVED) {
            employeeService.deductLeaveBalance(
                    leaveRequest.getEmployee().getId(),
                    leaveRequest.getLeaveType().name(),
                    leaveRequest.getTotalDays());
        } else {
            leaveRequest.setRejectionReason(actionRequest.getRejectionReason());
        }

        return mapToResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Transactional
    public LeaveDTO.LeaveResponse cancelLeave(Long leaveId, String employeeEmail) {
        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Request", leaveId));

        if (!leaveRequest.getEmployee().getEmail().equals(employeeEmail)) {
            throw new LeaveException("You can only cancel your own leave requests");
        }
        if (leaveRequest.getStatus() == LeaveStatus.CANCELLED) {
            throw new LeaveException("Leave is already cancelled");
        }
        if (leaveRequest.getStatus() == LeaveStatus.REJECTED) {
            throw new LeaveException("Cannot cancel a rejected leave");
        }
        if (leaveRequest.getStatus() == LeaveStatus.APPROVED) {
            employeeService.restoreLeaveBalance(
                    leaveRequest.getEmployee().getId(),
                    leaveRequest.getLeaveType().name(),
                    leaveRequest.getTotalDays());
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        return mapToResponse(leaveRequestRepository.save(leaveRequest));
    }

    @Transactional(readOnly = true)
    public List<LeaveDTO.LeaveResponse> getAllLeaves(LeaveStatus status) {
        List<LeaveRequest> leaves = (status != null)
                ? leaveRequestRepository.findByStatus(status)
                : leaveRequestRepository.findAll();
        return leaves.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveDTO.LeaveResponse> getMyLeaves(String employeeEmail, LeaveStatus status) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        List<LeaveRequest> leaves = (status != null)
                ? leaveRequestRepository.findByEmployeeIdAndStatus(employee.getId(), status)
                : leaveRequestRepository.findByEmployeeId(employee.getId());
        return leaves.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LeaveDTO.LeaveResponse getLeaveById(Long leaveId) {
        return mapToResponse(leaveRequestRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave Request", leaveId)));
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int days = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) days++;
            current = current.plusDays(1);
        }
        return days;
    }

    private void checkLeaveBalance(Employee employee, LeaveType leaveType, int days) {
        switch (leaveType) {
            case ANNUAL -> {
                if (employee.getAnnualBalance() < days)
                    throw new LeaveException("Insufficient annual leave. Available: "
                            + employee.getAnnualBalance() + ", Requested: " + days);
            }
            case SICK -> {
                if (employee.getSickBalance() < days)
                    throw new LeaveException("Insufficient sick leave. Available: "
                            + employee.getSickBalance() + ", Requested: " + days);
            }
            case CASUAL -> {
                if (employee.getCasualBalance() < days)
                    throw new LeaveException("Insufficient casual leave. Available: "
                            + employee.getCasualBalance() + ", Requested: " + days);
            }
        }
    }

    private LeaveDTO.LeaveResponse mapToResponse(LeaveRequest lr) {
        return LeaveDTO.LeaveResponse.builder()
                .id(lr.getId())
                .employeeId(lr.getEmployee().getId())
                .employeeName(lr.getEmployee().getName())
                .leaveType(lr.getLeaveType().name())
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .totalDays(lr.getTotalDays())
                .reason(lr.getReason())
                .status(lr.getStatus().name())
                .rejectionReason(lr.getRejectionReason())
                .approvedBy(lr.getApprovedBy())
                .createdAt(lr.getCreatedAt())
                .build();
    }
}