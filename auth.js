// ==========================
// AUTHENTICATION LOGIC
// ==========================

// ---------- SIGN UP ----------
const signupBtn = document.getElementById("signupBtn");

if (signupBtn) {
    signupBtn.addEventListener("click", function () {
        const user = document.getElementById("signupUser").value.trim();
        const pass = document.getElementById("signupPass").value;
        const confirm = document.getElementById("signupConfirm").value;
        const error = document.getElementById("signupError");
        const btn = this;

        // Clear previous errors
        error.textContent = "";

        // Client-side validation
        if (!user || !pass || !confirm) {
            error.textContent = "All fields are required.";
            return;
        }

        if (pass !== confirm) {
            error.textContent = "Passwords do not match.";
            return;
        }

        // Disable button during request
        btn.disabled = true;
        btn.textContent = "Creating Account...";

        // Send signup request to PHP endpoint
        fetch('signup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: user,
                password: pass,
                confirm: confirm
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Account created successfully!");
                window.location.href = "login.html";
            } else {
                error.textContent = data.message || "Error creating account. Please try again.";
                btn.disabled = false;
                btn.textContent = "Sign Up";
            }
        })
        .catch(err => {
            console.error('Error:', err);
            error.textContent = "Network error. Please check your connection and try again.";
            btn.disabled = false;
            btn.textContent = "Sign Up";
        });
    });
}

// ---------- LOGIN ----------
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", function () {
        const user = document.getElementById("loginUser").value.trim();
        const pass = document.getElementById("loginPass").value;
        const error = document.getElementById("loginError");
        const btn = this;

        // Clear previous errors
        error.textContent = "";

        // Client-side validation
        if (!user || !pass) {
            error.textContent = "Please enter User ID and Password.";
            return;
        }

        // Disable button during request
        btn.disabled = true;
        btn.textContent = "Logging in...";

        // Send login request to PHP endpoint
        fetch('login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: user,
                password: pass
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Redirect to dashboard or specified page
                window.location.href = data.redirect || "dashboard.html";
            } else {
                error.textContent = data.message || "Incorrect User ID or Password.";
                btn.disabled = false;
                btn.textContent = "Enter";
            }
        })
        .catch(err => {
            console.error('Error:', err);
            error.textContent = "Network error. Please check your connection and try again.";
            btn.disabled = false;
            btn.textContent = "Enter";
        });
    });
}
