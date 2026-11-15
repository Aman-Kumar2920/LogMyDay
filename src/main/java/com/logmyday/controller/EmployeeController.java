
package com.logmyday.controller;

import com.logmyday.entity.Employee;
import com.logmyday.service.EmployeeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @PostMapping
    public Employee addEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestBody Map<String, String> employeeData) {

        String employeeName = employeeData.get("employeeName");
        String email = employeeData.get("email");

        if (employeeName == null || employeeName.isBlank()
                || email == null || email.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Employee name and email are required."));
        }

        Employee updatedEmployee = employeeService.updateEmployee(
                id, employeeName.trim(), email.trim()
        );

        if (updatedEmployee == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message",
                            "Employee not found or inactive."));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Employee updated successfully.",
                "employeeId", updatedEmployee.getEmployeeId(),
                "employeeName", updatedEmployee.getEmployeeName(),
                "email", updatedEmployee.getEmail()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(@PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(Map.of(
                "message",
                "Employee deactivated successfully. Previous attendance and project records are preserved."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginData,
            HttpServletRequest httpRequest,
            HttpSession session) {

        String employeeIdValue = loginData.get("employeeId");
        String password = loginData.get("password");

        if (employeeIdValue == null || password == null
                || employeeIdValue.isBlank() || password.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Enter Employee ID and password."));
        }

        Long employeeId;

        try {
            employeeId = Long.valueOf(employeeIdValue);
        } catch (NumberFormatException error) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid Employee ID."));
        }

        Employee employee = employeeService.login(employeeId, password);

        if (employee != null) {

            session.removeAttribute("ADMIN_AUTHENTICATED");
            session.removeAttribute("ADMIN_ID");
            session.removeAttribute("EMPLOYEE_AUTHENTICATED");
            session.removeAttribute("EMPLOYEE_ID");

            httpRequest.changeSessionId();

            session.setAttribute("EMPLOYEE_AUTHENTICATED", true);
            session.setAttribute("EMPLOYEE_ID", employee.getEmployeeId());

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "employeeId", employee.getEmployeeId(),
                    "employeeName", employee.getEmployeeName(),
                    "email", employee.getEmail()
            ));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message",
                        "Invalid Employee ID or Password"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok(
                Map.of("message", "Employee logged out successfully.")
        );
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> passwordData) {

        String newPassword = passwordData.get("newPassword");

        if (newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "New password is required"));
        }

        boolean updated = employeeService.resetPassword(id, newPassword);

        if (updated) {
            return ResponseEntity.ok(
                    Map.of("message", "Password reset successful")
            );
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message",
                        "Employee not found or inactive"));
    }
}
