
document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("adminLoginForm");
    const loginButton = document.getElementById("loginButton");

    if (!loginForm || !loginButton) {
        console.error("Admin login form or button not found.");
        return;
    }

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const adminId = document.getElementById("adminId").value.trim();
        const password = document.getElementById("adminPassword").value;

        if (!adminId || !password) {
            alert("Please enter Admin ID and password.");
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Logging in...";

        try {

            const response = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    adminId: adminId,
                    password: password
                })
            });

            const responseText = await response.text();

            let result = {};

            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch {
                result = {};
            }

            if (response.ok) {

                window.location.replace("/admin-dashboard.html");

            } else {

                alert(result.message || "Invalid Admin ID or Password.");

                loginButton.disabled = false;
                loginButton.textContent = "Secure Login";
            }

        } catch (error) {

            console.error("Admin login error:", error);

            alert("Unable to connect to the server. Please try again.");

            loginButton.disabled = false;
            loginButton.textContent = "Secure Login";
        }

    });

});
