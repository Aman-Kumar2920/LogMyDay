
package com.logmyday.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ADMINS")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ADMIN_PK")
    private Long id;

    @Column(name = "ADMIN_ID", unique = true, nullable = false)
    private String adminId;

    @Column(name = "PASSWORD_HASH", nullable = false)
    private String passwordHash;

    public Admin() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
