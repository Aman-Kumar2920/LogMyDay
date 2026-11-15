
package com.logmyday.service;

import com.logmyday.entity.Attendance;
import com.logmyday.entity.Employee;
import com.logmyday.repository.AttendanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeService employeeService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeService employeeService) {
        this.attendanceRepository = attendanceRepository;
        this.employeeService = employeeService;
    }

    public Attendance checkIn(Long employeeId) {

        Employee employee = employeeService.getEmployeeById(employeeId);

        if (employee == null) {
            throw new RuntimeException("Employee not found");
        }

        LocalDate today = LocalDate.now();

        boolean alreadyCheckedIn = attendanceRepository.findAll()
                .stream()
                .anyMatch(a ->
                        a.getEmployee().getEmployeeId().equals(employeeId)
                                && today.equals(a.getAttendanceDate())
                );

        if (alreadyCheckedIn) {
            throw new RuntimeException("Already checked in today");
        }

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setCheckIn(LocalDateTime.now());
        attendance.setAttendanceDate(today);

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long employeeId) {

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository.findAll()
                .stream()
                .filter(a ->
                        a.getEmployee().getEmployeeId().equals(employeeId)
                                && today.equals(a.getAttendanceDate())
                )
                .max(Comparator.comparing(Attendance::getCheckIn))
                .orElseThrow(() ->
                        new RuntimeException("Check in first")
                );

        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Already checked out");
        }

        attendance.setCheckOut(LocalDateTime.now());

        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getLastSevenDays(Long employeeId) {

        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);

        return attendanceRepository.findAll()
                .stream()
                .filter(a ->
                        a.getEmployee().getEmployeeId().equals(employeeId)
                                && a.getAttendanceDate() != null
                                && !a.getAttendanceDate().isBefore(sevenDaysAgo)
                )
                .sorted(Comparator.comparing(
                        Attendance::getAttendanceDate
                ).reversed())
                .toList();
    }

    public List<Attendance> getAllAttendance() {

        return attendanceRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                        Attendance::getAttendanceDate,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .toList();
    }
}
