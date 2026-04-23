let map;
let marker;

async function trackOrder(){

  const id = document.getElementById("trackingId").value.trim();
  const result = document.getElementById("result");

  if(!id){
    result.innerHTML = `<p class="text-danger">Please enter tracking ID</p>`;
    return;
  }

  result.innerHTML = `<p class="text-info">Checking order...</p>`;

  try{

    const res = await fetch(`/api/orders/track/${id}`);
    const data = await res.json();

    console.log('Track response:', data); // Debug

    if(!res.ok || (data && !data.success)){
      result.innerHTML = `<p class="text-danger">${data?.message || 'Order not found or server error'}</p>`;
      document.getElementById('map').style.display = 'none';
      return;
    }

    // Status color
    let statusColor = "secondary";
    if(data.status === "Pending") statusColor = "warning";
    if(data.status === "Processing") statusColor = "info";
    if(data.status === "Shipped") statusColor = "primary";
    if(data.status === "Delivered") statusColor = "success";

    result.innerHTML = `
      <div class="card track-card p-3 p-sm-4 shadow-sm border-0">
        <h5>Status: 
          <span class="badge bg-${statusColor}">
            ${data.status}
          </span>
        </h5>

        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Address:</strong> ${data.address}</p>

        <hr>

        <h6>Products:</h6>
        ${data.products.map(p => `
          <div class="order-product-row mb-2">
            <img src="${p.image}" class="order-product-thumb" alt="${p.name}">
            <span>${p.name} (x${p.quantity || 1})</span>
          </div>
        `).join("")}
      </div>
    `;

    // ===== MAP INTEGRATION =====
    if(data.location && data.location.lat && data.location.lng){

      const lat = data.location.lat;
      const lng = data.location.lng;
      const mapEl = document.getElementById('map');

      // First time load
      if(!map){
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          try {
            map = L.map('map').setView([lat, lng], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(map);

            marker = L.marker([lat, lng], {
              title: 'Delivery Location'
            }).addTo(map).bindPopup('<p><strong>Delivery Location</strong></p>');

            mapEl.style.display = 'block';
            
            // Invalidate size after showing
            setTimeout(() => {
              map.invalidateSize();
            }, 100);

          } catch (mapErr) {
            console.error('Map init error:', mapErr);
          }
        }, 50);

      } else {
        // Update existing map
        try {
          if(marker) {
            marker.setLatLng([lat, lng]);
          } else {
            marker = L.marker([lat, lng], {
              title: 'Delivery Location'
            }).addTo(map).bindPopup('<p><strong>Delivery Location</strong></p>');
          }
          map.setView([lat, lng], 15);
          map.invalidateSize();
          mapEl.style.display = 'block';
        } catch (updateErr) {
          console.error('Map update error:', updateErr);
        }
      }

    } else {
      // Hide map if no location
      document.getElementById('map').style.display = 'none';
    }

  } catch(err){
    console.error('Track error:', err);
    result.innerHTML = `<p class="text-danger">Server error: ${err.message}</p>`;
    document.getElementById('map').style.display = 'none';
  }
}

// 🔥 AUTO REFRESH (LIVE FEEL)
setInterval(() => {
  const id = document.getElementById("trackingId").value.trim();
  if(id) trackOrder();
}, 5000);
