
document.addEventListener("DOMContentLoaded", () => {

    const employeeTableBody = document.getElementById("employeeTableBody");
    const attendanceTableBody = document.getElementById("attendanceTableBody");
    const projectTableBody = document.getElementById("projectTableBody");
    const attendanceRequestsTableBody =
        document.getElementById("attendanceRequestsTableBody");

    const totalEmployeesElement = document.getElementById("totalEmployees");
    const presentTodayElement = document.getElementById("presentToday");
    const absentTodayElement = document.getElementById("absentToday");

    const totalProjectsElement = document.getElementById("totalProjects");
    const assignedProjectsElement = document.getElementById("assignedProjects");
    const completedProjectsElement = document.getElementById("completedProjects");

    let employees = [];
    let attendanceRecords = [];
    let projects = [];
    let attendanceRequests = [];
    let editingProjectId = null;

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function formatDate(value) {
        if (!value) return "—";

        const date = String(value).substring(0, 10);
        const parts = date.split("-");

        if (parts.length !== 3) return escapeHtml(value);

        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    function formatTime(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHtml(value);
        }

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    function formatDateTime(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHtml(value);
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    }

    async function fetchData(url) {
        const response = await fetch(url, {
            method: "GET",
            credentials: "same-origin"
        });

        if (!response.ok) {
            throw new Error(`Request failed (${response.status}) for ${url}`);
        }

        return response.json();
    }

    async function readResponse(response) {
        const text = await response.text();

        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch {
            return { message: text };
        }
    }

    function showError(tableBody, message, columnCount) {
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="${columnCount}">
                    ${escapeHtml(message)}
                </td>
            </tr>
        `;
    }

    // Employee table

    function loadEmployeeTable(searchText = "") {
        if (!employeeTableBody) return;

        const search = searchText.toLowerCase();

        const filteredEmployees = employees.filter(employee => {
            return String(employee.employeeId ?? "").toLowerCase().includes(search) ||
                String(employee.employeeName ?? "").toLowerCase().includes(search) ||
                String(employee.email ?? "").toLowerCase().includes(search);
        });

        if (filteredEmployees.length === 0) {
            showError(employeeTableBody, "No employees found.", 5);
            return;
        }

        employeeTableBody.innerHTML = filteredEmployees.map(employee => `
            <tr>
                <td>${escapeHtml(employee.employeeId)}</td>
                <td>${escapeHtml(employee.employeeName)}</td>
                <td>${escapeHtml(employee.email || "—")}</td>
                <td>${formatDate(employee.createdAt)}</td>
                <td>
                    <button
                        type="button"
                        class="secondary-btn edit-employee-btn"
                        data-employee-id="${escapeHtml(employee.employeeId)}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-employee-btn"
                        data-employee-id="${escapeHtml(employee.employeeId)}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");
    }

    // Attendance table

    function loadAttendanceTable(searchText = "", selectedDate = "") {
        if (!attendanceTableBody) return;

        const search = searchText.toLowerCase();

        const filteredRecords = attendanceRecords.filter(record => {
            const employeeId = String(record.employee?.employeeId ?? "");
            const employeeName = String(record.employee?.employeeName ?? "");
            const attendanceDate = String(record.attendanceDate ?? "");

            const matchesSearch =
                employeeId.toLowerCase().includes(search) ||
                employeeName.toLowerCase().includes(search) ||
                attendanceDate.toLowerCase().includes(search);

            const matchesDate = !selectedDate || attendanceDate === selectedDate;

            return matchesSearch && matchesDate;
        });

        if (filteredRecords.length === 0) {
            showError(attendanceTableBody, "No attendance records found.", 6);
            return;
        }

        attendanceTableBody.innerHTML = filteredRecords.map(record => {

            const status = record.checkOut
                ? "Checked Out"
                : record.checkIn
                    ? "Checkout Pending"
                    : "Not Checked In";

            return `
                <tr>
                    <td>${escapeHtml(record.employee?.employeeId ?? "—")}</td>
                    <td>${escapeHtml(record.employee?.employeeName ?? "—")}</td>
                    <td>${formatDate(record.attendanceDate)}</td>
                    <td>${formatTime(record.checkIn)}</td>
                    <td>${formatTime(record.checkOut)}</td>
                    <td>${escapeHtml(status)}</td>
                </tr>
            `;
        }).join("");
    }

    // Project table

    function loadProjectTable(searchText = "") {
        if (!projectTableBody) return;

        const search = searchText.toLowerCase();

        const filteredProjects = projects.filter(project => {
            return String(project.projectId ?? "").toLowerCase().includes(search) ||
                String(project.projectName ?? "").toLowerCase().includes(search) ||
                String(project.employee?.employeeId ?? "").toLowerCase().includes(search) ||
                String(project.employee?.employeeName ?? "").toLowerCase().includes(search) ||
                String(project.status ?? "").toLowerCase().includes(search);
        });

        if (filteredProjects.length === 0) {
            showError(projectTableBody, "No projects found.", 7);
            return;
        }

        projectTableBody.innerHTML = filteredProjects.map(project => `
            <tr>
                <td>${escapeHtml(project.projectId)}</td>
                <td>${escapeHtml(project.projectName)}</td>
                <td>${escapeHtml(
            project.employee
                ? `${project.employee.employeeName} (${project.employee.employeeId})`
                : "Not Assigned"
        )}</td>
                <td>${formatDate(project.startDate)}</td>
                <td>${formatDate(project.dueDate)}</td>
                <td>${escapeHtml(project.status || "—")}</td>
                <td>
                    <button
                        type="button"
                        class="secondary-btn edit-project-btn"
                        data-project-id="${escapeHtml(project.projectId)}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-employee-btn delete-project-btn"
                        data-project-id="${escapeHtml(project.projectId)}">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");
    }

    // Dashboard summary cards

    function updateSummaryCards() {
        if (totalEmployeesElement) {
            totalEmployeesElement.textContent = employees.length;
        }

        const today = getTodayDate();

        const presentEmployeeIds = new Set(
            attendanceRecords
                .filter(record =>
                    String(record.attendanceDate ?? "").substring(0, 10) === today &&
                    record.checkIn
                )
                .map(record => record.employee?.employeeId)
                .filter(id => id !== undefined && id !== null)
        );

        const presentCount = presentEmployeeIds.size;
        const absentCount = Math.max(0, employees.length - presentCount);

        if (presentTodayElement) {
            presentTodayElement.textContent = presentCount;
        }

        if (absentTodayElement) {
            absentTodayElement.textContent = absentCount;
        }

        if (totalProjectsElement) {
            totalProjectsElement.textContent = projects.length;
        }

        if (assignedProjectsElement) {
            assignedProjectsElement.textContent = projects.filter(
                project => String(project.status ?? "").toUpperCase() === "ASSIGNED"
            ).length;
        }

        if (completedProjectsElement) {
            completedProjectsElement.textContent = projects.filter(
                project => String(project.status ?? "").toUpperCase() === "COMPLETED"
            ).length;
        }
    }

    // Load employees

    async function loadEmployees() {
        try {
            employees = await fetchData("/api/employees");
            loadEmployeeTable(employeeSearch?.value || "");
            updateSummaryCards();
        } catch (error) {
            console.error("Employee loading error:", error);
            showError(employeeTableBody, "Unable to load employees. Please check Admin login.", 5);
        }
    }

    // Load attendance

    async function loadAttendance() {
        try {
            attendanceRecords = await fetchData("/api/attendance");

            loadAttendanceTable(
                attendanceSearch?.value || "",
                attendanceDate?.value || ""
            );

            updateSummaryCards();
        } catch (error) {
            console.error("Attendance loading error:", error);
            showError(attendanceTableBody, "Unable to load attendance records.", 6);
        }
    }

    // Load projects

    async function loadProjects() {
        try {
            projects = await fetchData("/api/projects");
            loadProjectTable(projectSearch?.value || "");
            updateSummaryCards();
        } catch (error) {
            console.error("Project loading error:", error);
            showError(projectTableBody, "Unable to load projects.", 7);
        }
    }

    // Attendance Request Management

    function loadAttendanceRequestsTable() {
        if (!attendanceRequestsTableBody) return;

        if (!Array.isArray(attendanceRequests) || attendanceRequests.length === 0) {
            showError(
                attendanceRequestsTableBody,
                "No attendance requests submitted yet.",
                12
            );
            return;
        }

        attendanceRequestsTableBody.innerHTML = attendanceRequests.map(request => {

            const employee = request.employee || {};
            const attendance = request.attendance || {};

            const requestStatus = String(request.requestStatus || "PENDING").toUpperCase();
            const requestType = String(request.requestType || "—").toUpperCase();

            const isPending = requestStatus === "PENDING";

            let actionButtons = `<span>Processed</span>`;

            if (isPending) {
                actionButtons = `
                    <button
                        type="button"
                        class="primary-btn approve-attendance-request-btn"
                        data-request-id="${escapeHtml(request.requestId)}">
                        Approve
                    </button>

                    <button
                        type="button"
                        class="delete-employee-btn reject-attendance-request-btn"
                        data-request-id="${escapeHtml(request.requestId)}">
                        Reject
                    </button>
                `;
            }

            return `
                <tr>
                    <td>${formatDateTime(request.createdAt)}</td>

                    <td>${escapeHtml(employee.employeeId ?? "—")}</td>

                    <td>${escapeHtml(employee.employeeName ?? "—")}</td>

                    <td>${escapeHtml(attendance.attendanceId ?? "—")}</td>

                    <td>${formatDate(attendance.attendanceDate)}</td>

                    <td>${escapeHtml(requestType)}</td>

                    <td>${escapeHtml(request.reason || "—")}</td>

                    <td>${formatDateTime(request.requestedCheckIn)}</td>

                    <td>${formatDateTime(request.requestedCheckOut)}</td>

                    <td>${escapeHtml(requestStatus)}</td>

                    <td>${escapeHtml(request.adminNote || "—")}</td>

                    <td>${actionButtons}</td>
                </tr>
            `;
        }).join("");
    }

    async function loadAttendanceRequests() {
        if (!attendanceRequestsTableBody) return;

        try {
            attendanceRequests = await fetchData("/api/attendance-requests");

            loadAttendanceRequestsTable();

        } catch (error) {
            console.error("Attendance request loading error:", error);

            showError(
                attendanceRequestsTableBody,
                "Unable to load attendance requests. Please check Admin login.",
                12
            );
        }
    }

    async function processAttendanceRequest(requestId, decision) {

        const request = attendanceRequests.find(
            item => String(item.requestId) === String(requestId)
        );

        if (!request) {
            alert("Attendance request not found.");
            return;
        }

        const actionText = decision === "APPROVED" ? "approve" : "reject";

        const confirmed = confirm(
            `Are you sure you want to ${actionText} this attendance request?\n\n` +
            `Employee: ${request.employee?.employeeName || "Unknown"}\n` +
            `Request Type: ${request.requestType}\n` +
            `Attendance ID: ${request.attendance?.attendanceId ?? "—"}`
        );

        if (!confirmed) return;

        const adminNote = prompt(
            "Enter an admin note (optional):"
        );

        if (adminNote === null) {
            return;
        }

        if (adminNote.trim().length > 500) {
            alert("Admin note cannot exceed 500 characters.");
            return;
        }

        try {
            const response = await fetch(
                `/api/attendance-requests/${encodeURIComponent(requestId)}`,
                {
                    method: "PUT",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        decision: decision,
                        adminNote: adminNote.trim()
                    })
                }
            );

            const result = await readResponse(response);

            if (!response.ok) {
                throw new Error(
                    result.message || "Unable to process attendance request."
                );
            }

            alert(
                decision === "APPROVED"
                    ? "Attendance request approved successfully!"
                    : "Attendance request rejected successfully!"
            );

            await loadAttendanceRequests();

            // Refresh attendance records after an approved change.
            if (decision === "APPROVED") {
                await loadAttendance();
            }

        } catch (error) {
            console.error("Attendance request processing error:", error);

            alert(
                error.message || "Unable to process attendance request."
            );
        }
    }

    attendanceRequestsTableBody?.addEventListener("click", async event => {

        const approveButton = event.target.closest(
            ".approve-attendance-request-btn"
        );

        const rejectButton = event.target.closest(
            ".reject-attendance-request-btn"
        );

        if (approveButton) {
            const requestId = approveButton.dataset.requestId;

            approveButton.disabled = true;
            approveButton.textContent = "Processing...";

            await processAttendanceRequest(requestId, "APPROVED");

            return;
        }

        if (rejectButton) {
            const requestId = rejectButton.dataset.requestId;

            rejectButton.disabled = true;
            rejectButton.textContent = "Processing...";

            await processAttendanceRequest(requestId, "REJECTED");
        }
    });

    // Add Employee popup

    const employeeModal = document.getElementById("employeeModal");
    const addEmployeeBtn = document.getElementById("addEmployeeBtn");
    const closeEmployeeModalBtn = document.getElementById("closeEmployeeModalBtn");
    const cancelEmployeeBtn = document.getElementById("cancelEmployeeBtn");
    const addEmployeeForm = document.getElementById("addEmployeeForm");

    const newEmployeeId = document.getElementById("newEmployeeId");
    const newEmployeeName = document.getElementById("newEmployeeName");
    const newEmployeeEmail = document.getElementById("newEmployeeEmail");
    const newEmployeePassword = document.getElementById("newEmployeePassword");

    const employeeFormMessage = document.getElementById("employeeFormMessage");
    const saveEmployeeBtn = document.getElementById("saveEmployeeBtn");

    function openEmployeeModal() {
        if (!employeeModal) return;

        addEmployeeForm?.reset();

        if (employeeFormMessage) {
            employeeFormMessage.textContent = "";
            employeeFormMessage.style.color = "#dc2626";
        }

        employeeModal.hidden = false;
        newEmployeeId?.focus();
    }

    function closeEmployeeModal() {
        if (!employeeModal) return;

        employeeModal.hidden = true;
        addEmployeeForm?.reset();

        if (employeeFormMessage) {
            employeeFormMessage.textContent = "";
        }
    }

    addEmployeeBtn?.addEventListener("click", openEmployeeModal);
    closeEmployeeModalBtn?.addEventListener("click", closeEmployeeModal);
    cancelEmployeeBtn?.addEventListener("click", closeEmployeeModal);

    employeeModal?.addEventListener("click", event => {
        if (event.target === employeeModal) {
            closeEmployeeModal();
        }
    });

    if (addEmployeeForm) {
        addEmployeeForm.addEventListener("submit", async event => {
            event.preventDefault();

            const employeeId = Number(newEmployeeId.value);
            const employeeName = newEmployeeName.value.trim();
            const email = newEmployeeEmail.value.trim();
            const password = newEmployeePassword.value;

            if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
                employeeFormMessage.textContent = "Please enter a valid Employee ID.";
                return;
            }

            if (!employeeName || !email || !password) {
                employeeFormMessage.textContent = "Please fill in all fields.";
                return;
            }

            const duplicateEmployee = employees.some(
                employee => String(employee.employeeId) === String(employeeId)
            );

            if (duplicateEmployee) {
                employeeFormMessage.textContent =
                    "This Employee ID already exists. Please enter a different ID.";
                newEmployeeId.focus();
                return;
            }

            const employeeData = {
                employeeId: employeeId,
                employeeName: employeeName,
                email: email,
                password: password
            };

            saveEmployeeBtn.disabled = true;
            saveEmployeeBtn.textContent = "Saving...";
            employeeFormMessage.textContent = "";

            try {
                const response = await fetch("/api/employees", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(employeeData)
                });

                if (!response.ok) {
                    const errorText = await response.text();

                    if (
                        response.status === 409 ||
                        /duplicate|unique constraint|primary key/i.test(errorText)
                    ) {
                        throw new Error(
                            "This Employee ID already exists. Please use another ID."
                        );
                    }

                    throw new Error(
                        "Unable to save employee. Please check the details and try again."
                    );
                }

                closeEmployeeModal();
                await loadEmployees();

                alert("Employee added successfully!");

            } catch (error) {
                console.error("Add employee error:", error);

                employeeFormMessage.textContent =
                    error.message || "Something went wrong. Please try again.";

            } finally {
                saveEmployeeBtn.disabled = false;
                saveEmployeeBtn.textContent = "Save Employee";
            }
        });
    }

    // Update Employee popup

    const updateEmployeeModal = document.getElementById("updateEmployeeModal");
    const updateEmployeeForm = document.getElementById("updateEmployeeForm");

    const editEmployeeId = document.getElementById("editEmployeeId");
    const editEmployeeName = document.getElementById("editEmployeeName");
    const editEmployeeEmail = document.getElementById("editEmployeeEmail");

    const updateEmployeeFormMessage =
        document.getElementById("updateEmployeeFormMessage");

    const saveUpdateEmployeeBtn =
        document.getElementById("saveUpdateEmployeeBtn");

    const closeUpdateEmployeeModalBtn =
        document.getElementById("closeUpdateEmployeeModalBtn");

    const cancelUpdateEmployeeBtn =
        document.getElementById("cancelUpdateEmployeeBtn");

    function openUpdateEmployeeModal(employee) {
        if (!updateEmployeeModal || !employee) return;

        updateEmployeeForm?.reset();

        editEmployeeId.value = employee.employeeId;
        editEmployeeName.value = employee.employeeName || "";
        editEmployeeEmail.value = employee.email || "";

        if (updateEmployeeFormMessage) {
            updateEmployeeFormMessage.textContent = "";
        }

        updateEmployeeModal.hidden = false;
        editEmployeeName.focus();
    }

    function closeUpdateEmployeeModal() {
        if (!updateEmployeeModal) return;

        updateEmployeeModal.hidden = true;
        updateEmployeeForm?.reset();

        if (updateEmployeeFormMessage) {
            updateEmployeeFormMessage.textContent = "";
        }
    }

    // Handle Employee Edit and Delete button clicks

    employeeTableBody?.addEventListener("click", async event => {

        const editButton = event.target.closest(".edit-employee-btn");
        const deleteButton = event.target.closest(".delete-employee-btn");

        if (editButton) {
            const employeeId = editButton.dataset.employeeId;

            const employee = employees.find(
                item => String(item.employeeId) === String(employeeId)
            );

            if (employee) {
                openUpdateEmployeeModal(employee);
            }

            return;
        }

        if (deleteButton) {
            const employeeId = deleteButton.dataset.employeeId;

            const employee = employees.find(
                item => String(item.employeeId) === String(employeeId)
            );

            if (!employee) return;

            const confirmed = confirm(
                `Are you sure you want to deactivate ${employee.employeeName} (ID: ${employee.employeeId})?\n\n` +
                "They will no longer be able to log in or appear in the active employee list.\n\n" +
                "Their previous attendance and project records will be preserved."
            );

            if (!confirmed) return;

            deleteButton.disabled = true;
            deleteButton.textContent = "Deactivating...";

            try {
                const response = await fetch(
                    `/api/employees/${encodeURIComponent(employeeId)}`,
                    {
                        method: "DELETE",
                        credentials: "same-origin"
                    }
                );

                if (!response.ok) {
                    const errorData = await readResponse(response);

                    throw new Error(
                        errorData.message || "Unable to deactivate employee."
                    );
                }

                await loadEmployees();

                alert(
                    `${employee.employeeName} has been deactivated successfully.\n\n` +
                    "Previous attendance and project records have been preserved."
                );

            } catch (error) {
                console.error("Deactivate employee error:", error);

                alert(
                    error.message || "Something went wrong. Please try again."
                );

                deleteButton.disabled = false;
                deleteButton.textContent = "Delete";
            }
        }
    });

    closeUpdateEmployeeModalBtn?.addEventListener(
        "click",
        closeUpdateEmployeeModal
    );

    cancelUpdateEmployeeBtn?.addEventListener(
        "click",
        closeUpdateEmployeeModal
    );

    updateEmployeeModal?.addEventListener("click", event => {
        if (event.target === updateEmployeeModal) {
            closeUpdateEmployeeModal();
        }
    });

    // Save updated employee details

    if (updateEmployeeForm) {
        updateEmployeeForm.addEventListener("submit", async event => {
            event.preventDefault();

            const employeeId = editEmployeeId.value.trim();
            const employeeName = editEmployeeName.value.trim();
            const email = editEmployeeEmail.value.trim();

            if (!employeeName || !email) {
                updateEmployeeFormMessage.textContent =
                    "Please enter the employee name and email.";
                return;
            }

            const employeeData = {
                employeeName: employeeName,
                email: email
            };

            saveUpdateEmployeeBtn.disabled = true;
            saveUpdateEmployeeBtn.textContent = "Updating...";
            updateEmployeeFormMessage.textContent = "";

            try {
                const response = await fetch(
                    `/api/employees/${encodeURIComponent(employeeId)}`,
                    {
                        method: "PUT",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(employeeData)
                    }
                );

                if (!response.ok) {
                    const errorData = await readResponse(response);

                    throw new Error(
                        errorData.message ||
                        "Unable to update employee. Please try again."
                    );
                }

                closeUpdateEmployeeModal();

                await loadEmployees();

                alert("Employee details updated successfully!");

            } catch (error) {
                console.error("Update employee error:", error);

                updateEmployeeFormMessage.textContent =
                    error.message || "Something went wrong. Please try again.";

            } finally {
                saveUpdateEmployeeBtn.disabled = false;
                saveUpdateEmployeeBtn.textContent = "Update Employee";
            }
        });
    }

    // Employee search

    const employeeSearch = document.getElementById("employeeSearch");
    const searchEmployeeBtn = document.getElementById("searchEmployeeBtn");

    employeeSearch?.addEventListener("input", () => {
        loadEmployeeTable(employeeSearch.value);
    });

    searchEmployeeBtn?.addEventListener("click", () => {
        loadEmployeeTable(employeeSearch?.value || "");
    });

    // Attendance search and date filter

    const attendanceSearch = document.getElementById("attendanceSearch");
    const attendanceDate = document.getElementById("attendanceDate");
    const searchAttendanceBtn = document.getElementById("searchAttendanceBtn");

    function applyAttendanceFilter() {
        loadAttendanceTable(
            attendanceSearch?.value || "",
            attendanceDate?.value || ""
        );
    }

    attendanceSearch?.addEventListener("input", applyAttendanceFilter);
    attendanceDate?.addEventListener("change", applyAttendanceFilter);
    searchAttendanceBtn?.addEventListener("click", applyAttendanceFilter);

    // Project search

    const projectSearch = document.getElementById("projectSearch");
    const searchProjectBtn = document.getElementById("searchProjectBtn");

    projectSearch?.addEventListener("input", () => {
        loadProjectTable(projectSearch.value);
    });

    searchProjectBtn?.addEventListener("click", () => {
        loadProjectTable(projectSearch?.value || "");
    });

    // Project Management popup

    const projectModal = document.getElementById("projectModal");
    const addProjectBtn = document.getElementById("addProjectBtn");
    const closeProjectModalBtn = document.getElementById("closeProjectModalBtn");
    const cancelProjectBtn = document.getElementById("cancelProjectBtn");
    const projectForm = document.getElementById("projectForm");

    const projectModalTitle = document.getElementById("projectModalTitle");
    const projectNameInput = document.getElementById("projectName");
    const projectDescriptionInput = document.getElementById("projectDescription");
    const projectEmployeeSelect = document.getElementById("projectEmployee");
    const projectStartDateInput = document.getElementById("projectStartDate");
    const projectDueDateInput = document.getElementById("projectDueDate");
    const projectStatusSelect = document.getElementById("projectStatus");

    const projectFormMessage = document.getElementById("projectFormMessage");
    const saveProjectBtn = document.getElementById("saveProjectBtn");

    function closeProjectModal() {
        if (!projectModal) return;

        projectModal.hidden = true;
        projectForm?.reset();
        editingProjectId = null;

        if (projectModalTitle) {
            projectModalTitle.textContent = "Create New Project";
        }

        if (saveProjectBtn) {
            saveProjectBtn.textContent = "Save Project";
        }

        if (projectFormMessage) {
            projectFormMessage.textContent = "";
        }
    }

    async function populateProjectEmployees(selectedEmployeeId = "") {
        if (!projectEmployeeSelect) return;

        try {
            await loadEmployees();

            projectEmployeeSelect.innerHTML = `
                <option value="">Select an employee</option>
            `;

            if (employees.length === 0) {
                projectFormMessage.textContent = "No active employees available.";
                return;
            }

            employees.forEach(employee => {
                const option = document.createElement("option");

                option.value = employee.employeeId;
                option.textContent =
                    `${employee.employeeName} (${employee.employeeId})`;

                projectEmployeeSelect.appendChild(option);
            });

            if (selectedEmployeeId !== null && selectedEmployeeId !== undefined) {
                projectEmployeeSelect.value = String(selectedEmployeeId);
            }

        } catch (error) {
            console.error("Project employee loading error:", error);
            projectFormMessage.textContent = "Unable to load employees.";
        }
    }

    function openCreateProjectModal() {
        if (!projectModal || !projectForm) return;

        editingProjectId = null;
        projectForm.reset();

        projectModalTitle.textContent = "Create New Project";
        saveProjectBtn.textContent = "Save Project";
        projectFormMessage.textContent = "";

        projectModal.hidden = false;

        populateProjectEmployees();
    }

    async function openEditProjectModal(project) {
        if (!projectModal || !projectForm || !project) return;

        editingProjectId = project.projectId;
        projectForm.reset();

        projectModalTitle.textContent = "Edit / Reassign Project";
        saveProjectBtn.textContent = "Update Project";
        projectFormMessage.textContent = "";

        projectNameInput.value = project.projectName || "";
        projectDescriptionInput.value = project.description || "";
        projectStartDateInput.value = project.startDate || "";
        projectDueDateInput.value = project.dueDate || "";

        const existingStatus = String(project.status || "ASSIGNED").toUpperCase();

        const statusExists = Array.from(projectStatusSelect.options)
            .some(option => option.value === existingStatus);

        if (!statusExists) {
            const option = document.createElement("option");
            option.value = existingStatus;
            option.textContent = existingStatus;
            projectStatusSelect.appendChild(option);
        }

        projectStatusSelect.value = existingStatus;

        projectModal.hidden = false;

        await populateProjectEmployees(
            project.employee?.employeeId ?? ""
        );
    }

    addProjectBtn?.addEventListener("click", openCreateProjectModal);

    closeProjectModalBtn?.addEventListener("click", closeProjectModal);
    cancelProjectBtn?.addEventListener("click", closeProjectModal);

    projectModal?.addEventListener("click", event => {
        if (event.target === projectModal) {
            closeProjectModal();
        }
    });

    // Create or update project

    if (projectForm) {
        projectForm.addEventListener("submit", async event => {
            event.preventDefault();

            const projectName = projectNameInput.value.trim();
            const description = projectDescriptionInput.value.trim();
            const employeeId = Number(projectEmployeeSelect.value);
            const startDate = projectStartDateInput.value;
            const dueDate = projectDueDateInput.value;
            const status = projectStatusSelect.value;

            if (!projectName) {
                projectFormMessage.textContent = "Please enter a project name.";
                return;
            }

            if (!Number.isSafeInteger(employeeId) || employeeId <= 0) {
                projectFormMessage.textContent = "Please select an employee.";
                return;
            }

            if (!startDate || !dueDate) {
                projectFormMessage.textContent = "Please select both project dates.";
                return;
            }

            if (dueDate < startDate) {
                projectFormMessage.textContent =
                    "Due date cannot be earlier than start date.";
                return;
            }

            const projectData = {
                projectName: projectName,
                description: description,
                employee: {
                    employeeId: employeeId
                },
                startDate: startDate,
                dueDate: dueDate,
                status: status
            };

            const isEditing = editingProjectId !== null;

            const url = isEditing
                ? `/api/projects/${encodeURIComponent(editingProjectId)}`
                : "/api/projects";

            const method = isEditing ? "PUT" : "POST";

            saveProjectBtn.disabled = true;
            saveProjectBtn.textContent = isEditing ? "Updating..." : "Saving...";
            projectFormMessage.textContent = "";

            try {
                const response = await fetch(url, {
                    method: method,
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(projectData)
                });

                const result = await readResponse(response);

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to save project."
                    );
                }

                closeProjectModal();
                await loadProjects();

                alert(
                    isEditing
                        ? "Project updated successfully!"
                        : "Project created successfully!"
                );

            } catch (error) {
                console.error("Project save error:", error);

                projectFormMessage.textContent =
                    error.message || "Something went wrong. Please try again.";

            } finally {
                saveProjectBtn.disabled = false;
                saveProjectBtn.textContent =
                    editingProjectId !== null ? "Update Project" : "Save Project";
            }
        });
    }

    // Project Edit and Delete actions

    projectTableBody?.addEventListener("click", async event => {

        const editButton = event.target.closest(".edit-project-btn");
        const deleteButton = event.target.closest(".delete-project-btn");

        if (editButton) {
            const projectId = editButton.dataset.projectId;

            const project = projects.find(
                item => String(item.projectId) === String(projectId)
            );

            if (project) {
                await openEditProjectModal(project);
            }

            return;
        }

        if (deleteButton) {
            const projectId = deleteButton.dataset.projectId;

            const project = projects.find(
                item => String(item.projectId) === String(projectId)
            );

            if (!project) return;

            const confirmed = confirm(
                `Are you sure you want to delete project "${project.projectName}" (ID: ${project.projectId})?\n\n` +
                "This action permanently deletes this project record."
            );

            if (!confirmed) return;

            deleteButton.disabled = true;
            deleteButton.textContent = "Deleting...";

            try {
                const response = await fetch(
                    `/api/projects/${encodeURIComponent(projectId)}`,
                    {
                        method: "DELETE",
                        credentials: "same-origin"
                    }
                );

                const result = await readResponse(response);

                if (!response.ok) {
                    throw new Error(
                        result.message || "Unable to delete project."
                    );
                }

                await loadProjects();

                alert("Project deleted successfully!");

            } catch (error) {
                console.error("Project deletion error:", error);

                alert(
                    error.message || "Something went wrong. Please try again."
                );

                deleteButton.disabled = false;
                deleteButton.textContent = "Delete";
            }
        }
    });

    // Current date

    const currentDateElement = document.getElementById("currentDate");

    if (currentDateElement) {
        currentDateElement.textContent = new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // Escape key closes open popups

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            if (employeeModal && !employeeModal.hidden) {
                closeEmployeeModal();
            }

            if (updateEmployeeModal && !updateEmployeeModal.hidden) {
                closeUpdateEmployeeModal();
            }

            if (projectModal && !projectModal.hidden) {
                closeProjectModal();
            }
        }
    });

    // Admin logout

    const logoutButton = document.getElementById("logoutBtn");

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            logoutButton.disabled = true;

            try {
                const response = await fetch("/api/admin/logout", {
                    method: "POST",
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    throw new Error("Admin logout failed");
                }

                sessionStorage.removeItem("logmydayAdmin");
                window.location.href = "/admin-login.html";

            } catch (error) {
                console.error("Logout error:", error);
                alert("Unable to logout. Please try again.");
                logoutButton.disabled = false;
            }
        });
    }

    // Initial dashboard loading

    loadEmployees();
    loadAttendance();
    loadProjects();
    loadAttendanceRequests();

});
