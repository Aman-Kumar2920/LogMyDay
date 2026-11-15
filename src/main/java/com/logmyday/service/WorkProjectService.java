
package com.logmyday.service;

import com.logmyday.entity.Employee;
import com.logmyday.entity.WorkProject;
import com.logmyday.repository.EmployeeRepository;
import com.logmyday.repository.WorkProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkProjectService {

    private final WorkProjectRepository workProjectRepository;
    private final EmployeeRepository employeeRepository;

    public WorkProjectService(
            WorkProjectRepository workProjectRepository,
            EmployeeRepository employeeRepository) {
        this.workProjectRepository = workProjectRepository;
        this.employeeRepository = employeeRepository;
    }

    public WorkProject createProject(WorkProject project) {
        Long employeeId = project.getEmployee().getEmployeeId();

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        project.setEmployee(employee);

        return workProjectRepository.save(project);
    }

    public List<WorkProject> getAllProjects() {
        return workProjectRepository.findAll();
    }

    public List<WorkProject> getEmployeeProjects(Long employeeId) {
        return workProjectRepository.findByEmployeeEmployeeId(employeeId);
    }

    public WorkProject updateProject(Long projectId, WorkProject updatedProject) {
        WorkProject existingProject = workProjectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        existingProject.setProjectName(updatedProject.getProjectName());
        existingProject.setDescription(updatedProject.getDescription());
        existingProject.setStartDate(updatedProject.getStartDate());
        existingProject.setDueDate(updatedProject.getDueDate());
        existingProject.setStatus(updatedProject.getStatus());

        if (updatedProject.getEmployee() != null) {
            Long employeeId = updatedProject.getEmployee().getEmployeeId();

            Employee employee = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            existingProject.setEmployee(employee);
        }

        return workProjectRepository.save(existingProject);
    }

    public void deleteProject(Long projectId) {
        workProjectRepository.deleteById(projectId);
    }
}
