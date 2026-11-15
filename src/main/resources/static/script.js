let selectedRole = "employee";

const employeeRole = document.getElementById("employeeRole");
const adminRole = document.getElementById("adminRole");
const idLabel = document.getElementById("idLabel");
const employeeId = document.getElementById("employeeId");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

// Employee and Admin selection
employeeRole.addEventListener("click", function () {
    selectedRole = "employee";

    employeeRole.classList.add("active");
    adminRole.classList.remove("active");

    idLabel.textContent = "Employee ID";
    employeeId.placeholder = "Enter your Employee ID";

    loginMessage.textContent = "";
});

adminRole.addEventListener("click", function () {
    selectedRole = "admin";

    adminRole.classList.add("active");
    employeeRole.classList.remove("active");

    idLabel.textContent = "Admin ID";
    employeeId.placeholder = "Enter your Admin ID";

    loginMessage.textContent = "";
});

// Show and hide password
togglePassword.addEventListener("click", function () {
    if (password.type === "password") {
        password.type = "text";
        togglePassword.textContent = "Hide";
    } else {
        password.type = "password";
        togglePassword.textContent = "Show";
    }
});

// Login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const id = employeeId.value.trim();
    const enteredPassword = password.value;

    loginMessage.style.color = "#dc2626";

    if (!id || !enteredPassword) {
        loginMessage.textContent = selectedRole === "admin"
            ? "Please enter your Admin ID and password."
            : "Please enter your Employee ID and password.";
        return;
    }

    loginMessage.style.color = "#64748b";
    loginMessage.textContent = "Signing in...";

    try {
        let response;

        if (selectedRole === "admin") {

            response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    adminId: id,
                    password: enteredPassword
                })
            });

        } else {

            response = await fetch("/api/employees/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    employeeId: id,
                    password: enteredPassword
                })
            });
        }

        const result = await response.json();

        if (!response.ok) {
            loginMessage.style.color = "#dc2626";
            loginMessage.textContent =
                result.message || "Invalid ID or password.";
            return;
        }

        if (selectedRole === "admin") {

            loginMessage.style.color = "#16a34a";
            loginMessage.textContent = "Admin login successful! Redirecting...";

            window.location.href = "/admin-dashboard.html";

        } else {

            sessionStorage.setItem(
                "logmydayEmployee",
                JSON.stringify(result)
            );

            loginMessage.style.color = "#16a34a";
            loginMessage.textContent = "Login successful! Redirecting...";

            window.location.href = "/employee-dashboard.html";
        }

    } catch (error) {
        loginMessage.style.color = "#dc2626";
        loginMessage.textContent =
            "Unable to connect to the server. Please try again.";

        console.error(error);
    }
});