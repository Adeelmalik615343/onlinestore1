document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("productsContainer");

  // Fetch products from backend
  fetch("/api/products")
    .then(res => res.json())
    .then(products => {
      productsContainer.innerHTML = "";
      products.forEach(product => {
        productsContainer.innerHTML += `
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <img src="${product.image}" class="card-img-top" alt="${product.name}">
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
                <p class="card-text fw-bold">Price: $${product.price}</p>
                <button class="btn btn-success w-100" onclick='addToCart(${JSON.stringify(product).replace(/'/g, "\\'")})'>Add to Cart</button>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(err => {
      productsContainer.innerHTML = `<p class="text-danger">Failed to load products</p>`;
      console.error(err);
    });
});

// Add product to cart (simple localStorage demo)
function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  // Check if product already in cart, increase quantity
  const existing = cart.find(item => item._id === product._id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Product added to cart!");
}