
package com.logmyday.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "EMPLOYEES")
public class Employee {

    @Id
    @Column(name = "EMPLOYEE_ID")
    private Long employeeId;

    @Column(name = "EMPLOYEE_NAME", nullable = false)
    private String employeeName;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "PASSWORD", nullable = false)
    private String password;

    @Column(name = "EMAIL")
    private String email;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "EMPLOYEE_STATUS", nullable = false, length = 10)
    private String employeeStatus = "ACTIVE";

    public Employee() {
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (employeeStatus == null) {
            employeeStatus = "ACTIVE";
        }
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getEmployeeStatus() {
        return employeeStatus;
    }

    public void setEmployeeStatus(String employeeStatus) {
        this.employeeStatus = employeeStatus;
    }
}
