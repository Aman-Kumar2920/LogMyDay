
package com.logmyday.service;

import com.logmyday.entity.Attendance;
import com.logmyday.entity.AttendanceRequest;
import com.logmyday.repository.AttendanceRepository;
import com.logmyday.repository.AttendanceRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AttendanceRequestService {

    private final AttendanceRequestRepository attendanceRequestRepository;
    private final AttendanceRepository attendanceRepository;

    public AttendanceRequestService(
            AttendanceRequestRepository attendanceRequestRepository,
            AttendanceRepository attendanceRepository) {

        this.attendanceRequestRepository = attendanceRequestRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public AttendanceRequest createRequest(
            Long employeeId,
            Long attendanceId,
            String requestType,
            LocalDateTime requestedCheckIn,
            LocalDateTime requestedCheckOut,
            String reason) {

        if (attendanceId == null) {
            throw new RuntimeException("Attendance ID is required");
        }

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        if (!attendance.getEmployee().getEmployeeId().equals(employeeId)) {
            throw new RuntimeException("You cannot request changes to another employee's attendance");
        }

        if ("DELETED".equals(attendance.getRecordStatus())) {
            throw new RuntimeException("This attendance record is already deleted");
        }

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);

        if (attendance.getAttendanceDate() == null
                || attendance.getAttendanceDate().isBefore(sevenDaysAgo)
                || attendance.getAttendanceDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Requests are allowed only for the last seven days");
        }

        if (requestType == null
                || (!requestType.equals("UPDATE") && !requestType.equals("DELETE"))) {
            throw new RuntimeException("Invalid request type");
        }

        if (reason == null || reason.isBlank() || reason.length() > 500) {
            throw new RuntimeException("A reason of up to 500 characters is required");
        }

        if (requestType.equals("UPDATE")) {

            if (requestedCheckIn == null && requestedCheckOut == null) {
                throw new RuntimeException("Provide at least one corrected attendance time");
            }

            if (requestedCheckIn == null) {
                requestedCheckIn = attendance.getCheckIn();
            }

            if (requestedCheckOut == null) {
                requestedCheckOut = attendance.getCheckOut();
            }

            if (requestedCheckIn == null) {
                throw new RuntimeException("Check-in time is required");
            }

            if (requestedCheckOut != null
                    && requestedCheckOut.isBefore(requestedCheckIn)) {
                throw new RuntimeException("Check-out cannot be before check-in");
            }
        }

        boolean pendingRequest =
                attendanceRequestRepository
                        .existsByAttendance_AttendanceIdAndRequestStatus(
                                attendanceId, "PENDING");

        if (pendingRequest) {
            throw new RuntimeException("A pending request already exists for this attendance");
        }

        AttendanceRequest request = new AttendanceRequest();
        request.setAttendance(attendance);
        request.setEmployee(attendance.getEmployee());
        request.setRequestType(requestType);
        request.setRequestedCheckIn(requestedCheckIn);
        request.setRequestedCheckOut(requestedCheckOut);
        request.setReason(reason.trim());
        request.setRequestStatus("PENDING");

        return attendanceRequestRepository.save(request);
    }

    public List<AttendanceRequest> getEmployeeRequests(Long employeeId) {
        return attendanceRequestRepository
                .findByEmployee_EmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public List<AttendanceRequest> getAllRequests() {
        return attendanceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public AttendanceRequest getRequestById(Long requestId) {
        return attendanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Attendance request not found"));
    }

    @Transactional
    public AttendanceRequest processRequest(
            Long requestId,
            String decision,
            String adminNote) {

        AttendanceRequest request = getRequestById(requestId);

        if (!"PENDING".equals(request.getRequestStatus())) {
            throw new RuntimeException("This request has already been processed");
        }

        if (decision == null
                || (!decision.equals("APPROVED") && !decision.equals("REJECTED"))) {
            throw new RuntimeException("Invalid decision");
        }

        if (adminNote != null && adminNote.length() > 500) {
            throw new RuntimeException("Admin note cannot exceed 500 characters");
        }

        if (decision.equals("APPROVED")) {

            Attendance attendance = request.getAttendance();

            if ("UPDATE".equals(request.getRequestType())) {

                LocalDateTime checkIn = request.getRequestedCheckIn();
                LocalDateTime checkOut = request.getRequestedCheckOut();

                if (checkIn == null) {
                    throw new RuntimeException("Corrected check-in time is missing");
                }

                if (checkOut != null && checkOut.isBefore(checkIn)) {
                    throw new RuntimeException("Check-out cannot be before check-in");
                }

                attendance.setCheckIn(checkIn);
                attendance.setCheckOut(checkOut);

                attendanceRepository.save(attendance);

            } else if ("DELETE".equals(request.getRequestType())) {

                attendance.setRecordStatus("DELETED");
                attendanceRepository.save(attendance);

            } else {
                throw new RuntimeException("Invalid request type");
            }
        }

        request.setRequestStatus(decision);
        request.setAdminNote(
                adminNote == null || adminNote.isBlank()
                        ? null
                        : adminNote.trim()
        );
        request.setProcessedAt(LocalDateTime.now());

        return attendanceRequestRepository.save(request);
    }
}
