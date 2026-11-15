
package com.logmyday.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ATTENDANCE_REQUESTS")
public class AttendanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "REQUEST_ID")
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "ATTENDANCE_ID", nullable = false)
    private Attendance attendance;

    @ManyToOne
    @JoinColumn(name = "EMPLOYEE_ID", nullable = false)
    private Employee employee;

    @Column(name = "REQUEST_TYPE", nullable = false, length = 20)
    private String requestType;

    @Column(name = "REQUESTED_CHECK_IN")
    private LocalDateTime requestedCheckIn;

    @Column(name = "REQUESTED_CHECK_OUT")
    private LocalDateTime requestedCheckOut;

    @Column(name = "REASON", nullable = false, length = 500)
    private String reason;

    @Column(name = "REQUEST_STATUS", nullable = false, length = 20)
    private String requestStatus = "PENDING";

    @Column(name = "ADMIN_NOTE", length = 500)
    private String adminNote;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "PROCESSED_AT")
    private LocalDateTime processedAt;

    public AttendanceRequest() {
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (requestStatus == null) {
            requestStatus = "PENDING";
        }
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public Attendance getAttendance() {
        return attendance;
    }

    public void setAttendance(Attendance attendance) {
        this.attendance = attendance;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public LocalDateTime getRequestedCheckIn() {
        return requestedCheckIn;
    }

    public void setRequestedCheckIn(LocalDateTime requestedCheckIn) {
        this.requestedCheckIn = requestedCheckIn;
    }

    public LocalDateTime getRequestedCheckOut() {
        return requestedCheckOut;
    }

    public void setRequestedCheckOut(LocalDateTime requestedCheckOut) {
        this.requestedCheckOut = requestedCheckOut;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getRequestStatus() {
        return requestStatus;
    }

    public void setRequestStatus(String requestStatus) {
        this.requestStatus = requestStatus;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
