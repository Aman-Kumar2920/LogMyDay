
package com.logmyday.repository;

import com.logmyday.entity.WorkProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkProjectRepository extends JpaRepository<WorkProject, Long> {

    List<WorkProject> findByEmployeeEmployeeId(Long employeeId);
}
