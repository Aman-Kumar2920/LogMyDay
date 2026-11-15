
package com.logmyday.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .addFilterBefore(new OncePerRequestFilter() {

                    @Override
                    protected void doFilterInternal(
                            HttpServletRequest request,
                            HttpServletResponse response,
                            FilterChain filterChain)
                            throws ServletException, IOException {

                        String path = request.getRequestURI();
                        String method = request.getMethod();

                        HttpSession session = request.getSession(false);

                        boolean isAdmin =
                                session != null &&
                                        Boolean.TRUE.equals(session.getAttribute("ADMIN_AUTHENTICATED"));

                        Object employeeSessionId =
                                session == null ? null : session.getAttribute("EMPLOYEE_ID");

                        boolean isEmployee =
                                session != null &&
                                        Boolean.TRUE.equals(session.getAttribute("EMPLOYEE_AUTHENTICATED")) &&
                                        employeeSessionId != null;

                        String employeeId = employeeSessionId == null
                                ? ""
                                : employeeSessionId.toString();

                        if (path.equals("/admin-dashboard.html") && !isAdmin) {
                            response.sendRedirect("/admin-login.html");
                            return;
                        }

                        if (path.equals("/employee-dashboard.html") && !isEmployee) {
                            response.sendRedirect("/");
                            return;
                        }

                        if (path.equals("/api/admin/logout") && !isAdmin) {
                            sendUnauthorized(response);
                            return;
                        }

                        boolean adminOnly =
                                (path.equals("/api/employees") &&
                                        (method.equals("GET") || method.equals("POST"))) ||

                                        (path.matches("/api/employees/\\d+") &&
                                                method.equals("DELETE")) ||

                                        (path.equals("/api/projects") &&
                                                (method.equals("GET") || method.equals("POST"))) ||

                                        (path.matches("/api/projects/\\d+") &&
                                                (method.equals("PUT") || method.equals("DELETE"))) ||

                                        (path.equals("/api/attendance") &&
                                                method.equals("GET")) ||

                                        (path.equals("/api/attendance-requests") &&
                                                method.equals("GET"));

                        if (adminOnly && !isAdmin) {
                            sendUnauthorized(response);
                            return;
                        }

                        boolean employeeRecord =
                                path.matches("/api/employees/\\d+") &&
                                        method.equals("GET");

                        boolean passwordReset =
                                path.matches("/api/employees/\\d+/reset-password") &&
                                        method.equals("PUT");

                        boolean employeeAttendance =
                                path.matches("/api/attendance/(check-in|check-out|history)/\\d+");

                        boolean employeeProjects =
                                path.matches("/api/projects/employee/\\d+");

                        boolean employeeAttendanceRequests =
                                (path.equals("/api/attendance-requests") &&
                                        method.equals("POST")) ||
                                        (path.equals("/api/attendance-requests/my") &&
                                                method.equals("GET"));

                        if (employeeRecord || passwordReset ||
                                employeeAttendance || employeeProjects ||
                                employeeAttendanceRequests) {

                            String requestedId = path.replaceAll(
                                    ".*/(\\d+)(?:/reset-password)?$",
                                    "$1"
                            );

                            boolean isOwnRecord = requestedId.equals(employeeId);

                            if (!isAdmin && !(isEmployee &&
                                    (employeeAttendanceRequests || isOwnRecord))) {
                                sendUnauthorized(response);
                                return;
                            }
                        }

                        filterChain.doFilter(request, response);
                    }

                    private void sendUnauthorized(HttpServletResponse response)
                            throws IOException {

                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setContentType("application/json");
                        response.getWriter().write(
                                "{\"message\":\"You are not authorized to access this resource.\"}"
                        );
                    }

                }, AuthorizationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
