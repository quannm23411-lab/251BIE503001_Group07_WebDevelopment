// ===== ECO MOVE ADMIN DASHBOARD =====
// Lấy dữ liệu từ dashboard.json và render ra giao diện tổng quan

document.addEventListener("DOMContentLoaded", () => {
    fetch("../../data/dashboard.json")
        .then(res => res.json())
        .then(data => renderDashboard(data))
        .catch(() => console.error("❌ Lỗi: Không thể tải dữ liệu Dashboard."));
});

// Render toàn bộ dashboard
function renderDashboard(data) {
    // ===== Thống kê tổng =====
    document.getElementById("carCount").textContent = `${data.carsRented}/${data.carsTotal}`;
    document.getElementById("ordersToday").textContent = data.ordersToday;
    document.getElementById("monthlyRevenue").textContent = data.revenue + " triệu";
    document.getElementById("newUsers").textContent = data.newUsers;

    // ===== Thông báo hệ thống =====
    const alertList = document.getElementById("alertList");
    alertList.innerHTML = "";
    data.alerts.forEach(alert => {
        const li = document.createElement("li");
        li.textContent = "• " + alert;
        alertList.appendChild(li);
    });

    // ===== Vẽ biểu đồ doanh thu =====
    renderRevenueChart(data.months, data.revenueData);
}

// ===== Hàm vẽ biểu đồ Line Chart =====
function renderRevenueChart(labels, values) {
    const ctx = document.getElementById("revenueChart");

    // Nếu chart cũ tồn tại thì hủy để tránh lỗi khi reload
    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }

    window.revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Doanh thu (triệu VNĐ)",
                data: values,
                borderColor: "#6fa304",
                backgroundColor: "rgba(111, 163, 4, 0.15)",
                tension: 0.3,
                fill: true,
                pointBackgroundColor: "#6fa304"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: "bottom" },
                tooltip: { enabled: true }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: "#444" }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: "#444" },
                    grid: { color: "#eee" }
                }
            }
        }
    });
}
// ===== Kết thúc admin.js =====