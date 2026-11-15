
package com.logmyday.controller;

import com.logmyday.entity.Attendance;
import com.logmyday.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/check-in/{employeeId}")
    public Attendance checkIn(@PathVariable Long employeeId) {
        return attendanceService.checkIn(employeeId);
    }

    @PostMapping("/check-out/{employeeId}")
    public Attendance checkOut(@PathVariable Long employeeId) {
        return attendanceService.checkOut(employeeId);
    }

    @GetMapping("/history/{employeeId}")
    public List<Attendance> getAttendanceHistory(
            @PathVariable Long employeeId) {
        return attendanceService.getLastSevenDays(employeeId);
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }
}
