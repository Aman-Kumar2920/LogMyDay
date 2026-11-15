
package com.logmyday.repository;

import com.logmyday.entity.AttendanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRequestRepository extends JpaRepository<AttendanceRequest, Long> {

    List<AttendanceRequest> findByEmployee_EmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<AttendanceRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByAttendance_AttendanceIdAndRequestStatus(
            Long attendanceId,
            String requestStatus
    );
}
