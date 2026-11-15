
package com.logmyday.dto;

import java.time.LocalDateTime;

public class AttendanceRequestDTO {

    private Long attendanceId;
    private String requestType;
    private LocalDateTime requestedCheckIn;
    private LocalDateTime requestedCheckOut;
    private String reason;
    private String decision;
    private String adminNote;

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
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

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getAdminNote() {
        return adminNote;
    }

    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
}
