
package com.logmyday.service;

import com.logmyday.entity.Admin;
import com.logmyday.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository,
                        PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean login(String adminId, String password) {

        Optional<Admin> adminOptional =
                adminRepository.findByAdminId(adminId);

        if (adminOptional.isEmpty()) {
            return false;
        }

        Admin admin = adminOptional.get();

        return passwordEncoder.matches(
                password,
                admin.getPasswordHash()
        );
    }
}
