document.addEventListener("DOMContentLoaded", () => {
    fetch("../../data/orders.json")
        .then(res => res.json())
        .then(data => {
            renderTable(data);
            loadFilters(data);
            document.getElementById("applyFilter").addEventListener("click", () => filterData(data));
        })
        .catch(err => console.error("Không thể tải dữ liệu đơn hàng:", err));
});

function renderTable(data) {
    const tbody = document.getElementById("orderTable");
    tbody.innerHTML = "";

    data.forEach(order => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.phone}</td>
      <td>${order.vehicle}</td>
      <td>${order.date}</td>
      <td>${order.total.toLocaleString()}đ</td>
      <td><span class="status ${order.statusClass}">${order.status}</span></td>
      <td>
        <button class="action-btn">✏️ Edit</button>
        <button class="action-btn delete">🗑️</button>
      </td>
    `;
        tbody.appendChild(row);
    });
}

function loadFilters(data) {
    const brands = [...new Set(data.map(o => o.brand))];
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

    let filtered = data.filter(o =>
        (!brand || o.brand === brand) &&
        (!status || o.status === status) &&
        (!search || o.customer.toLowerCase().includes(search) || o.phone.includes(search))
    );

    if (price) {
        if (price === "<200000") filtered = filtered.filter(o => o.total < 200000);
        else if (price === "200000-400000") filtered = filtered.filter(o => o.total >= 200000 && o.total <= 400000);
        else filtered = filtered.filter(o => o.total > 400000);
    }

    renderTable(filtered);
}
