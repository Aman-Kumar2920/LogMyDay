
package com.logmyday.controller;

import com.logmyday.dto.AttendanceRequestDTO;
import com.logmyday.entity.AttendanceRequest;
import com.logmyday.service.AttendanceRequestService;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance-requests")
public class AttendanceRequestController {

    private final AttendanceRequestService attendanceRequestService;

    public AttendanceRequestController(AttendanceRequestService attendanceRequestService) {
        this.attendanceRequestService = attendanceRequestService;
    }

    @PostMapping
    public AttendanceRequest createRequest(
            @RequestBody AttendanceRequestDTO requestDTO,
            HttpSession session) {

        Long employeeId = (Long) session.getAttribute("EMPLOYEE_ID");

        if (employeeId == null) {
            throw new RuntimeException("Employee login required");
        }

        return attendanceRequestService.createRequest(
                employeeId,
                requestDTO.getAttendanceId(),
                requestDTO.getRequestType(),
                requestDTO.getRequestedCheckIn(),
                requestDTO.getRequestedCheckOut(),
                requestDTO.getReason()
        );
    }

    @GetMapping("/my")
    public List<AttendanceRequest> getMyRequests(HttpSession session) {

        Long employeeId = (Long) session.getAttribute("EMPLOYEE_ID");

        if (employeeId == null) {
            throw new RuntimeException("Employee login required");
        }

        return attendanceRequestService.getEmployeeRequests(employeeId);
    }

    @GetMapping
    public List<AttendanceRequest> getAllRequests() {
        return attendanceRequestService.getAllRequests();
    }

    @PutMapping("/{requestId}")
    public AttendanceRequest processRequest(
            @PathVariable Long requestId,
            @RequestBody AttendanceRequestDTO requestDTO) {

        return attendanceRequestService.processRequest(
                requestId,
                requestDTO.getDecision(),
                requestDTO.getAdminNote()
        );
    }
}
