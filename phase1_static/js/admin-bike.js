document.addEventListener("DOMContentLoaded", () => {
    fetch("../../data/products.json")
        .then(res => res.json())
        .then(data => {
            const bikes = mapProductData(data);
            renderTable(bikes);
            loadFilters(bikes);
            document.getElementById("applyFilter").addEventListener("click", () => filterData(bikes));
        })
        .catch(err => console.error("Không tải được dữ liệu sản phẩm", err));
});

function mapProductData(data) {
    // Map brandId sang tên hãng (có thể mở rộng)
    const brandMap = {
        B001: "VinFast",
        B002: "Pega",
        B003: "Dat Bike",
        B004: "Yadea",
        B005: "DK Bike"
    };

    return data.map(item => ({
        id: item.id,
        name: item.vehicleName,
        brand: brandMap[item.brandId] || "Khác",
        price: item.pricePerDay,
        battery: item.batteryCapacity,
        range: item.rangePerCharge + " KM",
        status: item.availabilityStatus ? "Sẵn sàng" : "Đang cho thuê",
        statusClass: item.availabilityStatus ? "ready" : "rented",
        location: "Đà Nẵng", // tạm fix location
        image: item.image
    }));
}

function renderTable(data) {
    const tbody = document.getElementById("bikeTable");
    tbody.innerHTML = "";
    data.forEach(bike => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>
        <div class="bike-info">
          <img src="../../${bike.image}" alt="${bike.name}">
          <div>
            <strong>${bike.name}</strong><br>
            <small>${bike.id}</small>
          </div>
        </div>
      </td>
      <td>${bike.price.toLocaleString()}đ</td>
      <td>${bike.battery}</td>
      <td>${bike.range}</td>
      <td><span class="status ${bike.statusClass}">${bike.status}</span></td>
      <td>${bike.location}</td>
      <td>
        <button class="action-btn">✏️ Edit</button>
        <button class="action-btn" style="background:#c0392b">🗑️</button>
      </td>
    `;
        tbody.appendChild(row);
    });
}

function loadFilters(data) {
    const brands = [...new Set(data.map(b => b.brand))];
    const select = document.getElementById("brandFilter");
    brands.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b;
        select.appendChild(opt);
    });
}

function filterData(data) {
    const brand = document.getElementById("brandFilter").value;
    const status = document.getElementById("statusFilter").value;
    const price = document.getElementById("priceFilter").value;
    const search = document.getElementById("searchInput").value.toLowerCase();

    let filtered = data.filter(b =>
        (!brand || b.brand === brand) &&
        (!status || b.status === status) &&
        (!search || b.name.toLowerCase().includes(search))
    );

    if (price) {
        if (price === "<100000") filtered = filtered.filter(b => b.price < 100000);
        else if (price === "100000-150000") filtered = filtered.filter(b => b.price >= 100000 && b.price <= 150000);
        else filtered = filtered.filter(b => b.price > 150000);
    }

    renderTable(filtered);
}
