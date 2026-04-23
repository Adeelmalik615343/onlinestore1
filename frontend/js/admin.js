document.addEventListener("DOMContentLoaded", () => {
  const productsTable = document.getElementById("productsTable").querySelector("tbody");
  const ordersTable = document.getElementById("ordersTable").querySelector("tbody");
  const usersTable = document.getElementById("usersTable").querySelector("tbody");
  const productForm = document.getElementById("productForm");
  const productMessage = document.getElementById("productMessage");
  const productId = document.getElementById("productId");
  const submitBtn = document.getElementById("submitBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  // Load Products
  async function loadProducts(){
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error('Failed to load products');
      const products = await res.json();
      productsTable.innerHTML = "";
      products.forEach(p => {
        productsTable.innerHTML += `
          <tr>
            <td>${p.name}</td>
            <td>${p.description}</td>
            <td>${p.category}</td>
            <td>$${p.price}</td>
            <td><img src="${p.image}" width="80" alt="${p.name}"></td>
            <td>
              <button class="btn btn-sm btn-warning edit-btn" data-id="${p._id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${p._id}">Delete</button>
            </td>
          </tr>
        `;
      });

      // Attach event listeners
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editProduct(e.target.dataset.id));
      });
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
      });
    } catch (err) {
      console.error('Error loading products:', err);
      productsTable.innerHTML = `<tr><td colspan="6" class="text-danger">Error loading products: ${err.message}</td></tr>`;
    }
  }

  // Load Orders
  async function loadOrders(){
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error('Failed to load orders');
      const orders = await res.json();
      ordersTable.innerHTML = "";
      orders.forEach(o => {
        let paymentInfo = o.paymentMethod;
        if(o.paymentMethod === "EasyPaisa"){
          paymentInfo += ` (Number: 03001234567)`;
        } else if(o.paymentMethod === "Card" && o.cardDetails){
          paymentInfo += ` (Card ending: ${o.cardDetails.number.slice(-4)})`;
        }

        const productsList = o.products.map(p => `${p.name} (x${p.quantity || 1})`).join(", ");

        const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered'].map(s => 
          `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
        ).join('');

        ordersTable.innerHTML += `
          <tr>
            <td>${o.trackingId}</td>
            <td>${o.name}</td>
            <td>${o.email}</td>
            <td>${o.address}</td>
            <td>
              <select class="form-select status-select" data-id="${o._id}">
                ${statusOptions}
              </select>
            </td>
            <td>${productsList}</td>
            <td>${paymentInfo}</td>
            <td>
              <button class="btn btn-sm btn-danger delete-order-btn" data-id="${o._id}">Delete</button>
            </td>
          </tr>
        `;
      });

      // Attach status change listeners
      document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => updateOrderStatus(e.target.dataset.id, e.target.value));
      });

      // Attach delete listeners
      document.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteOrder(e.target.dataset.id));
      });
    } catch (err) {
      console.error('Error loading orders:', err);
      ordersTable.innerHTML = `<tr><td colspan="7" class="text-danger">Error loading orders: ${err.message}</td></tr>`;
    }
  }

  // Load Users
  async function loadUsers(){
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error('Failed to load users');
      const users = await res.json();
      usersTable.innerHTML = "";
      users.forEach(u => {
        const joined = new Date(u.createdAt).toLocaleDateString();
        usersTable.innerHTML += `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${joined}</td>
            <td>
              <button class="btn btn-sm btn-danger delete-user-btn" data-id="${u._id}">Delete</button>
            </td>
          </tr>
        `;
      });

      // Attach delete listeners
      document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteUser(e.target.dataset.id));
      });
    } catch (err) {
      console.error('Error loading users:', err);
      usersTable.innerHTML = `<tr><td colspan="4" class="text-danger">Error loading users: ${err.message}</td></tr>`;
    }
  }

  // Add/Edit Product
  productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const id = productId.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';

    try {
      const res = await fetch(url, {
        method: method,
        body: formData
      });
      const data = await res.json();
      if(data.success){
        productMessage.innerHTML = `<p class="text-success">Product ${id ? 'updated' : 'added'}!</p>`;
        productForm.reset();
        productId.value = '';
        submitBtn.textContent = 'Add Product';
        cancelBtn.style.display = 'none';
        loadProducts();
      } else {
        productMessage.innerHTML = `<p class="text-danger">${data.message}</p>`;
      }
    } catch(err){
      console.error(err);
      productMessage.innerHTML = `<p class="text-danger">Server error.</p>`;
    }
  });

  // Edit Product
  async function editProduct(id){
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const product = await res.json();
      productId.value = product._id;
      document.getElementById('name').value = product.name;
      document.getElementById('description').value = product.description;
      document.getElementById('category').value = product.category;
      document.getElementById('price').value = product.price;
      // Image not pre-filled for simplicity
      submitBtn.textContent = 'Update Product';
      cancelBtn.style.display = 'inline-block';
    } catch(err){
      console.error(err);
      alert('Error loading product for edit: ' + err.message);
    }
  }

  // Delete Product
  async function deleteProduct(id){
    if(confirm('Are you sure you want to delete this product?')){
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if(data.success){
          loadProducts();
        } else {
          alert(data.message);
        }
      } catch(err){
        console.error(err);
        alert('Server error');
      }
    }
  }

  // Update Order Status
  async function updateOrderStatus(id, status){
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if(data.success){
        // Status updated
      } else {
        alert(data.message);
      }
    } catch(err){
      console.error(err);
      alert('Server error');
    }
  }

  // Delete Order
  async function deleteOrder(id){
    if(confirm('Are you sure you want to delete this order?')){
      try {
        const res = await fetch(`/api/orders/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if(data.success){
          loadOrders();
        } else {
          alert(data.message);
        }
      } catch(err){
        console.error(err);
        alert('Server error');
      }
    }
  }

  // Delete User
  async function deleteUser(id){
    if(confirm('Are you sure you want to delete this user?')){
      try {
        const res = await fetch(`/api/users/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if(data.success){
          loadUsers();
        } else {
          alert(data.message);
        }
      } catch(err){
        console.error(err);
        alert('Server error');
      }
    }
  }

  // Cancel Edit
  cancelBtn.addEventListener('click', () => {
    productForm.reset();
    productId.value = '';
    submitBtn.textContent = 'Add Product';
    cancelBtn.style.display = 'none';
    productMessage.innerHTML = '';
  });

  loadProducts();
  loadOrders();
  loadUsers();
});