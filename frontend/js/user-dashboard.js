document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    window.location.href = "/login";
    return;
  }

  // Display user info
  document.getElementById("userName").textContent = `Hello, ${user.name}`;
  document.getElementById("userNameDisplay").textContent = user.name;
  document.getElementById("userEmail").textContent = user.email;

  // Load user profile for more details
  loadUserProfile();

  // Load user orders
  loadUserOrders();

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  });
});

async function loadUserProfile() {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("/api/auth/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      const createdAt = new Date(data.user.createdAt).toLocaleDateString();
      document.getElementById("userCreatedAt").textContent = createdAt;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

async function loadUserOrders() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  try {
    const res = await fetch("/api/orders");
    const orders = await res.json();
    const userOrders = orders.filter(o => o.email === user.email);
    const ordersTable = document.getElementById("ordersTable").querySelector("tbody");
    ordersTable.innerHTML = "";
    userOrders.forEach(o => {
      const productsList = o.products.map(p => `${p.name} (x${p.quantity || 1})`).join(", ");
      const total = o.products.reduce((sum, p) => sum + (p.price * (p.quantity || 1)), 0);
      const date = new Date(o.createdAt || Date.now()).toLocaleDateString();
      ordersTable.innerHTML += `
        <tr>
          <td>${o.trackingId}</td>
          <td>${o.status}</td>
          <td>${productsList}</td>
          <td>$${total.toFixed(2)}</td>
          <td>${date}</td>
        </tr>
      `;
    });
  } catch (error) {
    console.error("Error loading orders:", error);
  }
}