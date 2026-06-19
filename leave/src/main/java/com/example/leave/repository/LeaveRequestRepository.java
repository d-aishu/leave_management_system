package com.example.leave.repository;

import com.example.leave.entity.LeaveRequest;
import com.example.leave.enums.LeaveStatus;
import com.example.leave.enums.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeId(Long employeeId);
    List<LeaveRequest> findByEmployeeIdAndStatus(Long employeeId, LeaveStatus status);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByLeaveType(LeaveType leaveType);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :employeeId " +
           "AND lr.status != 'REJECTED' AND lr.status != 'CANCELLED' " +
           "AND (lr.startDate <= :endDate AND lr.endDate >= :startDate)")
    List<LeaveRequest> findOverlappingLeaves(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(lr.totalDays), 0) FROM LeaveRequest lr " +
           "WHERE lr.employee.id = :employeeId " +
           "AND lr.leaveType = :leaveType AND lr.status = 'APPROVED'")
    Integer sumApprovedDaysByType(
            @Param("employeeId") Long employeeId,
            @Param("leaveType") LeaveType leaveType);
}
