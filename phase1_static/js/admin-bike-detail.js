document.addEventListener("DOMContentLoaded", () => {
    fetch("../../data/product-detail.json")
        .then(res => res.json())
        .then(data => renderProduct(data))
        .catch(err => console.error("Không thể tải dữ liệu sản phẩm:", err));
});

function renderProduct(data) {
    document.getElementById("vehicleName").textContent = `${data.vehicleName} / ${data.id}`;
    document.getElementById("mainImage").src = "../../" + data.images[0];

    // thumbnails
    const thumbs = document.getElementById("thumbs");
    data.images.forEach((img, i) => {
        const el = document.createElement("img");
        el.src = "../../" + img;
        if (i === 0) el.classList.add("active");
        el.addEventListener("click", () => changeMainImage(img, el));
        thumbs.appendChild(el);
    });

    // basic info
    document.getElementById("name").value = data.vehicleName;
    document.getElementById("description").value = data.description;
    document.getElementById("licensePlate").value = data.licensePlate;
    document.getElementById("brand").value = data.brand;

    // vehicle type
    const typeDiv = document.getElementById("vehicleType");
    ["Xe phổ thông", "Xe cao cấp", "Xe tay ga", "Xe thể thao"].forEach(type => {
        const span = document.createElement("span");
        span.className = "tag" + (data.type === type ? " active" : "");
        span.textContent = type;
        typeDiv.appendChild(span);
    });

    // status
    const statusDiv = document.getElementById("statusGroup");
    ["Sẵn sàng", "Đang cho thuê", "Bảo trì"].forEach(st => {
        const span = document.createElement("span");
        span.className = "tag" + (data.status === st ? " active" : "");
        span.textContent = st;
        statusDiv.appendChild(span);
    });
}

function changeMainImage(img, thumbEl) {
    document.getElementById("mainImage").src = "../../" + img;
    document.querySelectorAll(".thumbs img").forEach(i => i.classList.remove("active"));
    thumbEl.classList.add("active");
}
// ===== Kết thúc admin-bike-detail.js =====