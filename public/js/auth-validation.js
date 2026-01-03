document.addEventListener("DOMContentLoaded", () => {
  /* ================= UTILITIES ================= */

  // function isValidEmail(email) {
  //   return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // }

  // function setError(input, message) {
  //   const group = input.parentElement;
  //   const errorText = group.querySelector(".error-text");
  //   input.classList.add("error");
  //   input.classList.remove("success");
  //   errorText.textContent = message;
  // }

  // function setSuccess(input) {
  //   const group = input.parentElement;
  //   const errorText = group.querySelector(".error-text");
  //   input.classList.remove("error");
  //   input.classList.add("success");
  //   errorText.textContent = "";
  // }

  // /* ================= LOGIN ================= */

  // const loginForm = document.getElementById("loginForm");

  // if (loginForm) {
  //   const email = document.getElementById("email");
  //   const password = document.getElementById("password");
  //   const loginBtn = document.getElementById("loginBtn");

  //   email.addEventListener("input", () => {
  //     if (!email.value.trim())
  //       setError(email, "Email is required");
  //     else if (!isValidEmail(email.value))
  //       setError(email, "Invalid email format");
  //     else setSuccess(email);
  //   });

  //   password.addEventListener("input", () => {
  //     if (!password.value.trim())
  //       setError(password, "Password is required");
  //     else if (password.value.length < 6)
  //       setError(password, "Min 6 characters");
  //     else setSuccess(password);
  //   });

  //   loginForm.addEventListener("submit", (e) => {
  //     e.preventDefault();
  //     email.dispatchEvent(new Event("input"));
  //     password.dispatchEvent(new Event("input"));

  //     if (
  //       email.classList.contains("error") ||
  //       password.classList.contains("error")
  //     )
  //       return;

  //     // 🔥 LOGIN REQUEST
  //     fetch("/auth/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         email: email.value,
  //         password: password.value,
  //       }),
  //     }).then(() => (window.location.href = "/dashboard.html"));
  //   });
  // }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setError(input, message) {
    const group = input.parentElement;
    const errorText = group.querySelector(".error-text");
    input.classList.add("error");
    input.classList.remove("success");
    if (errorText) errorText.textContent = message;
  }

  function setSuccess(input) {
    const group = input.parentElement;
    const errorText = group.querySelector(".error-text");
    input.classList.remove("error");
    input.classList.add("success");
    if (errorText) errorText.textContent = "";
  }

  /* ================= LOGIN ================= */

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    const email = document.getElementById("email");
    const password = document.getElementById("password");

    email.addEventListener("input", () => {
      if (!email.value.trim()) setError(email, "Email is required");
      else if (!isValidEmail(email.value))
        setError(email, "Invalid email format");
      else setSuccess(email);
    });

    password.addEventListener("input", () => {
      if (!password.value.trim()) setError(password, "Password is required");
      else if (password.value.length < 6)
        setError(password, "Min 6 characters");
      else setSuccess(password);
    });

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      email.dispatchEvent(new Event("input"));
      password.dispatchEvent(new Event("input"));

      if (
        email.classList.contains("error") ||
        password.classList.contains("error")
      ) {
        return;
      }

      try {
        const res = await fetch("/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          }),
        });

        if (!res.ok) {
          setError(password, "Invalid email or password");
          return;
        }

        // ✅ LOGIN OK → REDIRECT
        window.location.href = "/dashboard.html";
      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });
  }

  /* ================= REGISTER ================= */

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    username.addEventListener("input", () => {
      if (!username.value.trim()) setError(username, "Username is required");
      else if (username.value.length < 3)
        setError(username, "Min 3 characters");
      else setSuccess(username);
    });

    email.addEventListener("input", () => {
      if (!email.value.trim()) setError(email, "Email is required");
      else if (!isValidEmail(email.value))
        setError(email, "Invalid email format");
      else setSuccess(email);
    });

    password.addEventListener("input", () => {
      if (!password.value) setError(password, "Password is required");
      else if (password.value.length < 6)
        setError(password, "Min 6 characters");
      else setSuccess(password);
    });

    confirmPassword.addEventListener("input", () => {
      if (!confirmPassword.value)
        setError(confirmPassword, "Confirm your password");
      else if (confirmPassword.value !== password.value)
        setError(confirmPassword, "Passwords do not match");
      else setSuccess(confirmPassword);
    });

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();

      username.dispatchEvent(new Event("input"));
      email.dispatchEvent(new Event("input"));
      password.dispatchEvent(new Event("input"));
      confirmPassword.dispatchEvent(new Event("input"));

      if (registerForm.querySelector(".error")) return;

      // 🔥 REGISTER REQUEST
      fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
        }),
      }).then(() => (window.location.href = "/login.html"));
    });
  }
});
