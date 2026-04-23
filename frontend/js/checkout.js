document.addEventListener("DOMContentLoaded", () => {

  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutMessage = document.getElementById("checkoutMessage");
  const paymentSelect = document.getElementById("paymentMethod");
  const easyPaisaInfo = document.getElementById("easyPaisaInfo");
  const cardForm = document.getElementById("cardForm");

  // Toggle payment method forms
  paymentSelect.addEventListener("change", () => {
    const method = paymentSelect.value;
    easyPaisaInfo.style.display = method === "EasyPaisa" ? "block" : "none";
    cardForm.style.display = method === "Card" ? "block" : "none";
  });

  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const products = JSON.parse(localStorage.getItem("cart")) || [];
    const paymentMethod = paymentSelect.value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    if (!paymentMethod) {
      checkoutMessage.innerHTML = `<p class="text-danger">Please select payment method</p>`;
      return;
    }

    if (!products.length) {
      checkoutMessage.innerHTML = `<p class="text-danger">Your cart is empty!</p>`;
      return;
    }

    // Card details
    let cardDetails = null;
    if (paymentMethod === "Card") {
      cardDetails = {
        number: document.getElementById("cardNumber").value,
        expiry: document.getElementById("expiry").value,
        cvc: document.getElementById("cvc").value
      };

      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc) {
        checkoutMessage.innerHTML = `<p class="text-danger">Please fill all card details</p>`;
        return;
      }
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, address, products, paymentMethod, cardDetails, latitude, longitude })
      });

      const data = await res.json();

      if (data.success) {

        checkoutMessage.innerHTML = `
          <div class="alert alert-success text-center">
            <h5>${data.message}</h5>

            <p class="mb-1">Your Tracking ID:</p>
            <h4 id="trackId">${data.trackingId}</h4>

            <button class="btn btn-outline-primary btn-sm mt-2" onclick="copyTracking()">
              Copy Tracking ID
            </button>

            <br>

            <a href="/track" class="btn btn-dark mt-3"></a>
          </div>
        `;

        localStorage.removeItem("cart");
        checkoutForm.reset();

      } else {
        checkoutMessage.innerHTML = `<p class="text-danger">${data.message}</p>`;
      }

    } catch (err) {
      console.error(err);
      checkoutMessage.innerHTML = `<p class="text-danger">Server error.</p>`;
    }
  });

});

// Copy tracking ID
function copyTracking() {
  const text = document.getElementById("trackId").innerText;
  navigator.clipboard.writeText(text);
  alert("Tracking ID copied!");
}