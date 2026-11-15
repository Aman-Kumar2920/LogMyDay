
package com.logmyday.service;

import com.logmyday.entity.Employee;
import com.logmyday.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Employee saveEmployee(Employee employee) {

        employee.setPassword(
                passwordEncoder.encode(employee.getPassword())
        );

        if (employee.getCreatedAt() == null) {
            employee.setCreatedAt(LocalDateTime.now());
        }

        employee.setEmployeeStatus("ACTIVE");

        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .filter(employee ->
                        "ACTIVE".equalsIgnoreCase(
                                employee.getEmployeeStatus()
                        )
                )
                .toList();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    public Employee updateEmployee(Long id, String employeeName, String email) {

        Employee employee = employeeRepository.findById(id).orElse(null);

        if (employee == null ||
                !"ACTIVE".equalsIgnoreCase(employee.getEmployeeStatus())) {
            return null;
        }

        employee.setEmployeeName(employeeName);
        employee.setEmail(email);

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id).orElse(null);

        if (employee != null) {
            employee.setEmployeeStatus("INACTIVE");
            employeeRepository.save(employee);
        }
    }

    public Employee login(Long employeeId, String rawPassword) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElse(null);

        if (employee == null ||
                !"ACTIVE".equalsIgnoreCase(employee.getEmployeeStatus())) {
            return null;
        }

        if (passwordEncoder.matches(rawPassword, employee.getPassword())) {
            return employee;
        }

        return null;
    }

    public boolean resetPassword(Long employeeId, String newPassword) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElse(null);

        if (employee == null ||
                !"ACTIVE".equalsIgnoreCase(employee.getEmployeeStatus())) {
            return false;
        }

        employee.setPassword(passwordEncoder.encode(newPassword));

        employeeRepository.save(employee);

        return true;
    }
}
