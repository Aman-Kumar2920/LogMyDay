
package com.logmyday.config;

import com.logmyday.entity.Admin;
import com.logmyday.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${logmyday.admin.password:}")
    private String adminPassword;

    public AdminInitializer(
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (adminRepository.findByAdminId("admin").isPresent()) {
            return;
        }

        if (adminPassword == null || adminPassword.isBlank()) {
            System.out.println("Admin account not created: configure LOGMYDAY_ADMIN_PASSWORD.");
            return;
        }

        Admin admin = new Admin();
        admin.setAdminId("admin");
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));

        adminRepository.save(admin);

        System.out.println("Initial admin account created successfully.");
    }
}
