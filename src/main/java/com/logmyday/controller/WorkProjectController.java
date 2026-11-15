
package com.logmyday.controller;

import com.logmyday.entity.WorkProject;
import com.logmyday.service.WorkProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
public class WorkProjectController {

    private final WorkProjectService workProjectService;

    public WorkProjectController(WorkProjectService workProjectService) {
        this.workProjectService = workProjectService;
    }

    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody WorkProject project) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(workProjectService.createProject(project));
        } catch (RuntimeException error) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", error.getMessage()));
        }
    }

    @GetMapping
    public List<WorkProject> getAllProjects() {
        return workProjectService.getAllProjects();
    }

    @GetMapping("/employee/{employeeId}")
    public List<WorkProject> getEmployeeProjects(
            @PathVariable Long employeeId) {
        return workProjectService.getEmployeeProjects(employeeId);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long projectId,
            @RequestBody WorkProject project) {
        try {
            return ResponseEntity.ok(
                    workProjectService.updateProject(projectId, project));
        } catch (RuntimeException error) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", error.getMessage()));
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long projectId) {
        workProjectService.deleteProject(projectId);
        return ResponseEntity.ok(
                Map.of("message", "Project deleted successfully"));
    }
}
