document.addEventListener("DOMContentLoaded", () => {

    const API_URL = "http://localhost:8080/api";

    const employee = JSON.parse(
        sessionStorage.getItem("logmydayEmployee") || "null"
    );

    if (!employee || !employee.employeeId) {
        window.location.href = "index.html";
        return;
    }

    const employeeId = employee.employeeId;

    const employeeName = document.getElementById("employeeName");
    const employeeAvatar = document.getElementById("employeeAvatar");
    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const profileId = document.getElementById("profileId");

    const liveClock = document.getElementById("liveClock");
    const todayDate = document.getElementById("todayDate");
    const attendanceDate = document.getElementById("attendanceDate");

    const attendanceTable = document.getElementById("attendanceTable");
    const attendanceRequestsTable = document.getElementById("attendanceRequestsTable");
    const employeeProjectsTable = document.getElementById("employeeProjectsTable");

    const totalDays = document.getElementById("totalDays");
    const presentDays = document.getElementById("presentDays");
    const attendanceRate = document.getElementById("attendanceRate");

    const todayStatus = document.getElementById("todayStatus");
    const attendanceMessage = document.getElementById("attendanceMessage");

    const checkInBtn = document.getElementById("checkInBtn");
    const checkOutBtn = document.getElementById("checkOutBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const name = employee.employeeName || "Employee";
    const initial = name.charAt(0).toUpperCase();

    if (employeeName) employeeName.textContent = name;
    if (employeeAvatar) employeeAvatar.textContent = initial;
    if (profileAvatar) profileAvatar.textContent = initial;
    if (profileName) profileName.textContent = name;
    if (profileId) profileId.textContent = employeeId;

    function updateClock() {
        const now = new Date();

        if (liveClock) {
            liveClock.textContent = now.toLocaleTimeString();
        }

        if (todayDate) {
            todayDate.textContent = now.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        }

        if (attendanceDate) {
            attendanceDate.textContent = now.toLocaleDateString("en-IN");
        }
    }

    updateClock();
    setInterval(updateClock, 1000);

    function showMessage(message, isError = false) {
        if (attendanceMessage) {
            attendanceMessage.textContent = message;
            attendanceMessage.style.color = isError ? "#dc2626" : "#168653";
        }
    }

    function getDateString(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function formatTime(value) {
        if (!value) return "--";

        const date = new Date(value);

        if (isNaN(date.getTime())) return value;

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function formatDate(value) {
        if (!value) return "--";

        const dateString = String(value).substring(0, 10);
        const parts = dateString.split("-");

        if (parts.length !== 3) return value;

        const date = new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

        return date.toLocaleDateString("en-IN");
    }

    function formatDateTimeInput(value) {
        if (!value) return "";

        return String(value).substring(0, 16);
    }

    // Convert date-time into Spring Boot LocalDateTime format.
    function convertToBackendDateTime(value) {
        if (!value || !value.trim()) return null;

        const input = value.trim();

        // Accept ISO format: YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss.
        const isoMatch = input.match(
            /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
        );

        if (isoMatch) {
            const year = Number(isoMatch[1].substring(0, 4));
            const month = Number(isoMatch[1].substring(5, 7));
            const day = Number(isoMatch[1].substring(8, 10));
            const hour = Number(isoMatch[2]);
            const minute = Number(isoMatch[3]);
            const second = Number(isoMatch[4] || "0");

            const checkDate = new Date(year, month - 1, day);

            if (
                checkDate.getFullYear() !== year ||
                checkDate.getMonth() !== month - 1 ||
                checkDate.getDate() !== day ||
                hour > 23 ||
                minute > 59 ||
                second > 59
            ) {
                throw new Error("Invalid date or time. Please check your entry.");
            }

            return `${isoMatch[1]}T${isoMatch[2]}:${isoMatch[3]}:${isoMatch[4] || "00"}`;
        }

        // Accept 12-hour format: YYYY-MM-DD hh:mm AM/PM.
        const amPmMatch = input.match(
            /^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i
        );

        if (amPmMatch) {
            const datePart = amPmMatch[1];
            const year = Number(datePart.substring(0, 4));
            const month = Number(datePart.substring(5, 7));
            const day = Number(datePart.substring(8, 10));

            let hour = Number(amPmMatch[2]);

            const minute = Number(amPmMatch[3]);
            const period = amPmMatch[4].toUpperCase();

            const checkDate = new Date(year, month - 1, day);

            if (
                checkDate.getFullYear() !== year ||
                checkDate.getMonth() !== month - 1 ||
                checkDate.getDate() !== day ||
                hour < 1 ||
                hour > 12 ||
                minute > 59
            ) {
                throw new Error("Invalid date or time. Please check your entry.");
            }

            if (period === "PM" && hour !== 12) hour += 12;
            if (period === "AM" && hour === 12) hour = 0;

            return `${datePart}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
        }

        throw new Error(
            "Invalid date-time format. Use YYYY-MM-DDTHH:mm or YYYY-MM-DD hh:mm AM/PM."
        );
    }

    async function getErrorMessage(response) {
        const text = await response.text();

        if (!text) {
            return "Request failed. Please try again.";
        }

        try {
            const data = JSON.parse(text);
            return data.message || data.error || text;
        } catch {
            return text;
        }
    }

    async function loadAttendance() {
        try {
            const response = await fetch(
                `${API_URL}/attendance/history/${employeeId}`,
                { credentials: "same-origin" }
            );

            if (!response.ok) {
                throw new Error("Unable to load attendance");
            }

            const records = await response.json();

            if (!Array.isArray(records)) {
                throw new Error("Invalid attendance data received");
            }

            const today = new Date();
            const todayString = getDateString(today);

            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6);

            const startDateString = getDateString(sevenDaysAgo);

            const recentRecords = records.filter(record => {
                if (!record.attendanceDate) return false;

                const recordDate = String(record.attendanceDate).substring(0, 10);

                return recordDate >= startDateString &&
                    recordDate <= todayString;
            });

            recentRecords.sort((a, b) => {
                return String(b.attendanceDate).localeCompare(
                    String(a.attendanceDate)
                );
            });

            if (attendanceTable) {
                attendanceTable.innerHTML = "";

                if (recentRecords.length === 0) {
                    const row = document.createElement("tr");
                    const cell = document.createElement("td");

                    cell.colSpan = 5;
                    cell.className = "empty-message";
                    cell.textContent = "No attendance records found in the last 7 days.";

                    row.appendChild(cell);
                    attendanceTable.appendChild(row);

                } else {
                    recentRecords.forEach(record => {
                        const row = document.createElement("tr");

                        const dateCell = document.createElement("td");
                        dateCell.textContent = formatDate(record.attendanceDate);

                        const checkInCell = document.createElement("td");
                        checkInCell.textContent = formatTime(record.checkIn);

                        const checkOutCell = document.createElement("td");
                        checkOutCell.textContent = formatTime(record.checkOut);

                        const statusCell = document.createElement("td");
                        statusCell.textContent = record.checkIn ? "Present" : "Absent";

                        const actionCell = document.createElement("td");

                        const updateButton = document.createElement("button");
                        updateButton.type = "button";
                        updateButton.textContent = "Request Update";
                        updateButton.className = "request-update-btn";
                        updateButton.style.margin = "3px";
                        updateButton.style.padding = "7px 10px";
                        updateButton.style.cursor = "pointer";

                        updateButton.addEventListener("click", () => {
                            requestAttendanceUpdate(record);
                        });

                        const deleteButton = document.createElement("button");
                        deleteButton.type = "button";
                        deleteButton.textContent = "Request Removal";
                        deleteButton.className = "request-delete-btn";
                        deleteButton.style.margin = "3px";
                        deleteButton.style.padding = "7px 10px";
                        deleteButton.style.cursor = "pointer";

                        deleteButton.addEventListener("click", () => {
                            requestAttendanceRemoval(record);
                        });

                        actionCell.append(updateButton, deleteButton);

                        row.append(
                            dateCell,
                            checkInCell,
                            checkOutCell,
                            statusCell,
                            actionCell
                        );

                        attendanceTable.appendChild(row);
                    });
                }
            }

            if (totalDays) {
                totalDays.textContent = recentRecords.length;
            }

            const presentCount = recentRecords.filter(
                record => record.checkIn
            ).length;

            if (presentDays) {
                presentDays.textContent = presentCount;
            }

            if (attendanceRate) {
                const rate = recentRecords.length === 0
                    ? 0
                    : Math.round(
                        (presentCount / recentRecords.length) * 100
                    );

                attendanceRate.textContent = rate + "%";
            }

            const todayRecord = recentRecords.find(record => {
                return String(record.attendanceDate).substring(0, 10) === todayString;
            });

            if (todayRecord) {
                if (todayStatus) {
                    todayStatus.textContent = todayRecord.checkOut
                        ? "Checked Out"
                        : "Checked In";
                }

                if (checkInBtn) {
                    checkInBtn.disabled = true;
                }

                if (checkOutBtn) {
                    checkOutBtn.disabled =
                        !todayRecord.checkIn || !!todayRecord.checkOut;
                }

            } else {
                if (todayStatus) {
                    todayStatus.textContent = "Not Checked In";
                }

                if (checkInBtn) checkInBtn.disabled = false;
                if (checkOutBtn) checkOutBtn.disabled = true;
            }

        } catch (error) {
            console.error("Attendance error:", error);

            if (attendanceTable) {
                attendanceTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-message">
                            Unable to load attendance.
                        </td>
                    </tr>
                `;
            }

            if (totalDays) totalDays.textContent = "0";
            if (presentDays) presentDays.textContent = "0";
            if (attendanceRate) attendanceRate.textContent = "0%";
        }
    }

    async function loadMyRequests() {
        if (!attendanceRequestsTable) return;

        try {
            const response = await fetch(
                `${API_URL}/attendance-requests/my`,
                { credentials: "same-origin" }
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const requests = await response.json();

            attendanceRequestsTable.innerHTML = "";

            if (!Array.isArray(requests) || requests.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");

                cell.colSpan = 6;
                cell.className = "empty-message";
                cell.textContent = "No attendance requests submitted yet.";

                row.appendChild(cell);
                attendanceRequestsTable.appendChild(row);
                return;
            }

            requests.forEach(request => {
                const row = document.createElement("tr");

                const requestDateCell = document.createElement("td");
                requestDateCell.textContent = formatDate(request.createdAt);

                const attendanceIdCell = document.createElement("td");
                attendanceIdCell.textContent =
                    request.attendance?.attendanceId ?? "--";

                const typeCell = document.createElement("td");
                typeCell.textContent = request.requestType || "--";

                const reasonCell = document.createElement("td");
                reasonCell.textContent = request.reason || "--";

                const statusCell = document.createElement("td");
                statusCell.textContent = request.requestStatus || "--";

                const noteCell = document.createElement("td");
                noteCell.textContent = request.adminNote || "--";

                row.append(
                    requestDateCell,
                    attendanceIdCell,
                    typeCell,
                    reasonCell,
                    statusCell,
                    noteCell
                );

                attendanceRequestsTable.appendChild(row);
            });

        } catch (error) {
            console.error("Attendance requests error:", error);

            attendanceRequestsTable.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-message">
                        Unable to load attendance requests.
                    </td>
                </tr>
            `;
        }
    }

    async function submitAttendanceRequest(requestData) {
        try {
            const response = await fetch(
                `${API_URL}/attendance-requests`,
                {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestData)
                }
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            alert("Your attendance request has been submitted successfully.");

            await loadMyRequests();

        } catch (error) {
            console.error("Submit request error:", error);
            alert(error.message || "Unable to submit attendance request.");
        }
    }

    function requestAttendanceUpdate(record) {
        if (!record.attendanceId) {
            alert("Attendance ID is missing. Cannot submit this request.");
            return;
        }

        const correctedCheckIn = prompt(
            "Enter the corrected check-in date and time.\n" +
            "Example: 2026-11-14 01:30 PM or 2026-11-14T13:30",
            formatDateTimeInput(record.checkIn)
        );

        if (correctedCheckIn === null) return;

        const correctedCheckOut = prompt(
            "Enter the corrected check-out date and time.\n" +
            "Example: 2026-11-14 01:45 PM or 2026-11-14T13:45",
            formatDateTimeInput(record.checkOut)
        );

        if (correctedCheckOut === null) return;

        if (!correctedCheckIn.trim() && !correctedCheckOut.trim()) {
            alert("Please enter at least one corrected time.");
            return;
        }

        const reason = prompt(
            "Explain why this attendance record needs correction:"
        );

        if (reason === null) return;

        if (!reason.trim()) {
            alert("Please provide a reason for the request.");
            return;
        }

        try {
            const checkIn = convertToBackendDateTime(correctedCheckIn);
            const checkOut = convertToBackendDateTime(correctedCheckOut);

            if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn)) {
                alert("Check-out cannot be earlier than check-in.");
                return;
            }

            submitAttendanceRequest({
                attendanceId: record.attendanceId,
                requestType: "UPDATE",
                requestedCheckIn: checkIn,
                requestedCheckOut: checkOut,
                reason: reason.trim()
            });

        } catch (error) {
            alert(error.message);
        }
    }

    function requestAttendanceRemoval(record) {
        if (!record.attendanceId) {
            alert("Attendance ID is missing. Cannot submit this request.");
            return;
        }

        const confirmed = confirm(
            "Do you want to request removal of the attendance record for " +
            formatDate(record.attendanceDate) + "?\n\n" +
            "The record will NOT be removed unless the administrator approves."
        );

        if (!confirmed) return;

        const reason = prompt(
            "Explain why you want this attendance record removed:"
        );

        if (reason === null) return;

        if (!reason.trim()) {
            alert("Please provide a reason for the request.");
            return;
        }

        submitAttendanceRequest({
            attendanceId: record.attendanceId,
            requestType: "DELETE",
            requestedCheckIn: null,
            requestedCheckOut: null,
            reason: reason.trim()
        });
    }

    async function loadEmployeeProjects() {
        try {
            const response = await fetch(
                `${API_URL}/projects/employee/${employeeId}`,
                { credentials: "same-origin" }
            );

            if (!response.ok) {
                throw new Error("Unable to load projects");
            }

            const projects = await response.json();

            if (!employeeProjectsTable) return;

            employeeProjectsTable.innerHTML = "";

            if (!projects || projects.length === 0) {
                employeeProjectsTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-message">
                            No projects assigned to you yet.
                        </td>
                    </tr>
                `;
                return;
            }

            projects.forEach(project => {
                const row = document.createElement("tr");

                const nameCell = document.createElement("td");
                nameCell.textContent = project.projectName || "--";

                const descriptionCell = document.createElement("td");
                descriptionCell.textContent = project.description || "--";

                const startCell = document.createElement("td");
                startCell.textContent = formatDate(project.startDate);

                const dueCell = document.createElement("td");
                dueCell.textContent = formatDate(project.dueDate);

                const statusCell = document.createElement("td");
                statusCell.textContent = project.status || "ASSIGNED";

                row.append(
                    nameCell,
                    descriptionCell,
                    startCell,
                    dueCell,
                    statusCell
                );

                employeeProjectsTable.appendChild(row);
            });

        } catch (error) {
            console.error("Projects error:", error);

            if (employeeProjectsTable) {
                employeeProjectsTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-message">
                            Unable to load your projects.
                        </td>
                    </tr>
                `;
            }
        }
    }

    async function checkIn() {
        try {
            const response = await fetch(
                `${API_URL}/attendance/check-in/${employeeId}`,
                {
                    method: "POST",
                    credentials: "same-origin"
                }
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            showMessage("Check-in recorded successfully.");
            await loadAttendance();

        } catch (error) {
            showMessage(error.message, true);
        }
    }

    async function checkOut() {
        try {
            const response = await fetch(
                `${API_URL}/attendance/check-out/${employeeId}`,
                {
                    method: "POST",
                    credentials: "same-origin"
                }
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            showMessage("Check-out recorded successfully.");
            await loadAttendance();

        } catch (error) {
            showMessage(error.message, true);
        }
    }

    if (checkInBtn) {
        checkInBtn.addEventListener("click", checkIn);
    }

    if (checkOutBtn) {
        checkOutBtn.addEventListener("click", checkOut);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {

            logoutBtn.disabled = true;

            try {
                const response = await fetch(
                    `${API_URL}/employees/logout`,
                    {
                        method: "POST",
                        credentials: "same-origin"
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to log out. Please try again.");
                }

                sessionStorage.removeItem("logmydayEmployee");
                window.location.href = "index.html";

            } catch (error) {
                alert(error.message);
                logoutBtn.disabled = false;
            }
        });
    }

    loadAttendance();
    loadMyRequests();
    loadEmployeeProjects();
});