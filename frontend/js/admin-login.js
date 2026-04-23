document.addEventListener("DOMContentLoaded", () => {
  const adminLoginForm = document.getElementById("adminLoginForm");
  const loginMessage = document.getElementById("loginMessage");

  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if(data.success){
        loginMessage.innerHTML = `<p class="text-success">${data.message}</p>`;
        // Redirect to admin panel after login
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1000);
      } else {
        loginMessage.innerHTML = `<p class="text-danger">${data.message}</p>`;
      }
    } catch(err){
      console.error(err);
      loginMessage.innerHTML = `<p class="text-danger">Server error.</p>`;
    }
  });
});