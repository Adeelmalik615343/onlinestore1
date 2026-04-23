document.addEventListener("DOMContentLoaded", () => {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const checkoutForm = document.getElementById("checkoutForm");

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Render cart table
  function renderCart() {
    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * (item.quantity || 1); // use quantity if available
      cartItems.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>${item.quantity || 1}</td>
          <td><button class="btn btn-danger btn-sm remove" data-index="${index}">Remove</button></td>
        </tr>
      `;
    });

    cartTotal.textContent = total.toFixed(2);

    // Remove item
    document.querySelectorAll(".remove").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = parseInt(btn.dataset.index);
        cart.splice(i, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });
  }

  renderCart();

  // Handle checkout form submission
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const address = document.getElementById("address").value;

      if (!name || !email || !address || cart.length === 0) {
        return alert("All fields are required and cart must not be empty");
      }

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            address,
            products: cart // Send full cart array
          })
        });

        const data = await res.json();

        if (data.success) {
          alert("Order placed successfully!");
          localStorage.removeItem("cart"); // Clear cart
          window.location.href = "/"; // Redirect to home or thank you page
        } else {
          alert(data.message || "Something went wrong");
        }

      } catch (err) {
        console.error(err);
        alert("Server error");
      }
    });
  }
});