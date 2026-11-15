
package com.logmyday.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ATTENDANCE")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ATTENDANCE_ID")
    private Long attendanceId;

    @ManyToOne
    @JoinColumn(name = "EMPLOYEE_ID", nullable = false)
    private Employee employee;

    @Column(name = "CHECK_IN")
    private LocalDateTime checkIn;

    @Column(name = "CHECK_OUT")
    private LocalDateTime checkOut;

    @Column(name = "ATTENDANCE_DATE")
    private LocalDate attendanceDate;

    @Column(name = "RECORD_STATUS", length = 10)
    private String recordStatus = "ACTIVE";

    public Attendance() {
    }

    @PrePersist
    public void prePersist() {
        if (recordStatus == null) {
            recordStatus = "ACTIVE";
        }
    }

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LocalDateTime getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(LocalDateTime checkIn) {
        this.checkIn = checkIn;
    }

    public LocalDateTime getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(LocalDateTime checkOut) {
        this.checkOut = checkOut;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getRecordStatus() {
        return recordStatus;
    }

    public void setRecordStatus(String recordStatus) {
        this.recordStatus = recordStatus;
    }
}
