document.addEventListener("DOMContentLoaded", async () => {

  const container = document.getElementById("productsContainer");
  const cartCount = document.getElementById("cartCount");
  const searchInput = document.getElementById("searchInput");
  const categoriesContainer = document.getElementById("categoriesContainer");

  let productsData = [];
  let categoriesData = [];
  let currentCategory = "all";

  // Update cart counter
  function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cartCount) {
      cartCount.textContent = cart.length;
    }
  }

  updateCartCount();

  // Load categories
  try {
    const catRes = await fetch("/api/products/categories");
    if (catRes.ok) {
      categoriesData = await catRes.json();
      renderCategories(categoriesData);
    }
  } catch (err) {
    console.error("Failed to load categories:", err);
  }

  try {

    const res = await fetch("/api/products");

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await res.json();

    productsData = products;

    renderProducts(products);

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='text-danger'>Failed to load products.</p>";
  }

  function renderProducts(products) {

    if (!container) return;

    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = "<p>No products found</p>";
      return;
    }

    products.forEach((p, index) => {

      container.innerHTML += `
        <div class="col-lg-6 col-md-4 col-sm-6 product-item" data-aos="fade-up" data-aos-delay="${index * 100}">
          <div class="card h-100 shadow-sm">

            <a href="product.html?id=${p._id}" class="text-decoration-none">
              <img src="${p.image}" class="card-img-top product-img" alt="${p.name}">
            </a>

            <div class="card-body d-flex flex-column">

              <a href="product.html?id=${p._id}" class="text-decoration-none text-dark">
                <h5 class="card-title product-name">${p.name}</h5>
              </a>

              <p class="card-text text-muted small flex-grow-1">${p.description || ""}</p>

              <p class="product-price">$${p.price}</p>

              <button 
                class="btn btn-warning add-to-cart w-100"
                data-id="${p._id}"
                data-name="${p.name}"
                data-price="${p.price}"
                data-image="${p.image}">
                🛒 Add to Cart
              </button>

            </div>
          </div>
        </div>
      `;
    });

    attachCartEvents();
  }

  function renderCategories(categories) {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = '<a href="#" class="btn btn-outline-primary me-2 mb-2 category-btn" data-category="all">All</a>';

    categories.forEach(cat => {
      categoriesContainer.innerHTML += `<a href="#" class="btn btn-outline-secondary me-2 mb-2 category-btn" data-category="${cat}">${cat}</a>`;
    });

    attachCategoryEvents();
  }

  // Category filtering
  function attachCategoryEvents() {
    const categoryBtns = document.querySelectorAll(".category-btn");

    categoryBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const category = btn.dataset.category;
        filterProducts(category);
      });
    });
  }

  function filterProducts(category) {
    currentCategory = category;
    let filtered = productsData;
    if (category !== "all") {
      filtered = productsData.filter(p => p.category === category);
    }
    renderProducts(filtered);
  }

  // Add to cart
  function attachCartEvents() {

    const buttons = document.querySelectorAll(".add-to-cart");

    buttons.forEach(btn => {

      btn.addEventListener("click", () => {

        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const image = btn.dataset.image;

        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        cart.push({ name, price, image });

        localStorage.setItem("cart", JSON.stringify(cart));

        updateCartCount();

        alert("Product added to cart");

      });

    });

  }

  // Search Feature
  if (searchInput) {

    searchInput.addEventListener("keyup", () => {

      const value = searchInput.value.toLowerCase();

      let filtered = productsData;

      if (currentCategory !== "all") {
        filtered = productsData.filter(p => p.category === currentCategory);
      }

      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(value) ||
        (p.description || "").toLowerCase().includes(value)
      );

      renderProducts(filtered);

    });

  }

});