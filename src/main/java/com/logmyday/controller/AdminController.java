
package com.logmyday.controller;

import com.logmyday.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest,
            HttpSession session) {

        String adminId = request.get("adminId");
        String password = request.get("password");

        if (adminId == null || password == null ||
                adminId.isBlank() || password.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Enter Admin ID and password."));
        }

        if (adminService.login(adminId, password)) {

            session.removeAttribute("ADMIN_AUTHENTICATED");
            session.removeAttribute("ADMIN_ID");
            session.removeAttribute("EMPLOYEE_AUTHENTICATED");
            session.removeAttribute("EMPLOYEE_ID");

            httpRequest.changeSessionId();

            session.setAttribute("ADMIN_AUTHENTICATED", true);
            session.setAttribute("ADMIN_ID", adminId);

            return ResponseEntity.ok(
                    Map.of("message", "Admin login successful.")
            );
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid Admin ID or password."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok(
                Map.of("message", "Admin logged out successfully.")
        );
    }
}
