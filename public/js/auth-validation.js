document.addEventListener("DOMContentLoaded", () => {
  /* ================= HELPERS ================= */
  const isEmailValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPasswordStrong = (value) =>
    /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value);

  const showError = (input, message) => {
    const small = input.parentElement.querySelector("small");
    if (small) small.innerText = message;
    input.classList.add("error");
    input.classList.remove("success");
  };

  const showSuccess = (input) => {
    const small = input.parentElement.querySelector("small");
    if (small) small.innerText = "";
    input.classList.remove("error");
    input.classList.add("success");
  };

  /* ================= LOGIN FORM ================= */
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    email.addEventListener("blur", () => {
      if (!email.value.trim()) showError(email, "Email is required");
      else if (!isEmailValid(email.value)) showError(email, "Invalid email");
      else showSuccess(email);
    });

    password.addEventListener("blur", () => {
      if (!password.value.trim()) showError(password, "Password is required");
      else showSuccess(password);
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      email.dispatchEvent(new Event("blur"));
      password.dispatchEvent(new Event("blur"));

      if (email.classList.contains("error") || password.classList.contains("error"))
        return;

      try {
        const res = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.value, password: password.value }),
        });

        if (!res.ok) {
          showError(password, "Invalid email or password");
          return;
        }

        const data = await res.json();
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard";
      } catch (err) {
        alert("Server error. Try again.");
      }
    });
  }

  /* ================= REGISTER FORM ================= */
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const formMessage = document.getElementById("formMessage");

    const validateUsername = () => {
      if (!username.value.trim()) showError(username, "Username is required");
      else if (username.value.trim().length < 3)
        showError(username, "Min 3 characters");
      else showSuccess(username);
      return !username.classList.contains("error");
    };

    const validateEmail = () => {
      if (!email.value.trim()) showError(email, "Email is required");
      else if (!isEmailValid(email.value)) showError(email, "Invalid email");
      else showSuccess(email);
      return !email.classList.contains("error");
    };

    const validatePassword = () => {
      if (!password.value.trim()) showError(password, "Password is required");
      else if (!isPasswordStrong(password.value))
        showError(password, "Min 6 chars, letters & numbers");
      else showSuccess(password);
      return !password.classList.contains("error");
    };

    const validateConfirmPassword = () => {
      if (!confirmPassword.value.trim())
        showError(confirmPassword, "Please confirm password");
      else if (confirmPassword.value !== password.value)
        showError(confirmPassword, "Passwords do not match");
      else showSuccess(confirmPassword);
      return !confirmPassword.classList.contains("error");
    };

    username.addEventListener("blur", validateUsername);
    email.addEventListener("blur", validateEmail);
    password.addEventListener("blur", validatePassword);
    confirmPassword.addEventListener("blur", validateConfirmPassword);

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      formMessage.innerText = "";
      formMessage.className = "form-message";

      const valid =
        validateUsername() &&
        validateEmail() &&
        validatePassword() &&
        validateConfirmPassword();

      if (!valid) return;

      try {
        const res = await fetch("/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.value.trim(),
            email: email.value.trim(),
            password: password.value,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          formMessage.innerText = data.message || "Registration failed";
          formMessage.classList.add("error");
          return;
        }

        formMessage.innerText = "Account created! Redirecting to login...";
        formMessage.classList.add("success");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (err) {
        formMessage.innerText = "Server error. Try again.";
        formMessage.classList.add("error");
      }
    });
  }
});
