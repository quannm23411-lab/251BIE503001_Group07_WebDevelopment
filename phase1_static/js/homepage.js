// ===============================================
// 🔧 CONFIG PATH
// ===============================================
const isClientPage = location.pathname.includes("/pages/client/");
const DATA_PATHS = [
    isClientPage ? "../../assets/data/" : "assets/data/",
    isClientPage ? "../../data/" : "data/"
];
const IMG_PREFIX = isClientPage ? "../../" : "";

// ===============================================
// ⚙️ UTILITIES
// ===============================================
const $ = (s) => document.querySelector(s);
const vnd = (n) => (n ?? 0).toLocaleString("vi-VN") + "đ";
const byRatingDesc = (a, b) => (b.rating ?? 0) - (a.rating ?? 0);

async function getJSON(file) {
    // thử nhiều path khác nhau
    let lastErr;
    for (const base of DATA_PATHS) {
        try {
            const res = await fetch(base + file);
            if (res.ok) return res.json();
            lastErr = new Error(`Fetch ${base + file}: ${res.status}`);
        } catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Không tìm thấy JSON file: " + file);
}

// ===============================================
// 🎨 RENDER PRODUCT CARD
// ===============================================
function productCard(p) {
    const discountBadge = p.discount > 0
        ? `<span class="badge bg-danger position-absolute top-0 start-0 m-2">-${p.discount}%</span>`
        : "";
    const statusClass = p.availabilityStatus ? "text-success" : "text-secondary";
    const statusText = p.availabilityStatus ? "Còn xe" : "Hết xe";

    return `
  <article class="product-card position-relative">
    ${discountBadge}
    <img src="${IMG_PREFIX}${p.image}" alt="${p.vehicleName}" class="product-card__img" loading="lazy"/>
    <h3 class="product-card__name">${p.vehicleName}</h3>
    <p class="product-card__price">
      Giá thuê chỉ từ <span>${vnd(p.pricePerDay)}</span>
    </p>
    <small class="${statusClass}">${statusText}</small>
  </article>
  `;
}

function renderInto(id, list) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = (list && list.length)
        ? list.map(productCard).join("")
        : `<p class="text-muted">Chưa có xe phù hợp.</p>`;
}

// ===============================================
// 🕓 PROMO BANNER COUNTDOWN (OPTIONAL)
// ===============================================
async function setupPromo() {
    try {
        const codes = await getJSON("discount_codes.json");
        const now = new Date();
        const live = codes
            .filter(c => c.active && new Date(c.endDate) > now)
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        if (!live.length) return;

        const c = live[0];
        const codeEl = $("#promoCodeText");
        const amountEl = $("#promoAmountText");
        if (codeEl) codeEl.textContent = c.code;
        if (amountEl) amountEl.textContent = c.discountAmount;

        const daysEl = $("#days"), hoursEl = $("#hours"),
            minsEl = $("#minutes"), secsEl = $("#seconds");

        const tick = () => {
            const diff = new Date(c.endDate) - new Date();
            if (diff <= 0) {
                daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = "00";
                return;
            }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            daysEl.textContent = String(d).padStart(2, "0");
            hoursEl.textContent = String(h).padStart(2, "0");
            minsEl.textContent = String(m).padStart(2, "0");
            secsEl.textContent = String(s).padStart(2, "0");

            setTimeout(tick, 1000);
        };
        tick();
    } catch (_) {
        console.warn("⏳ Không tìm thấy discount_codes.json — bỏ qua banner.");
    }
}

// ===============================================
// 🚀 MAIN FUNCTION
// ===============================================
(async function initHomepage() {
    try {
        const products = await getJSON("products.json");

        // 1️⃣ Thuê nhiều tháng này
        const topRent = [...products].sort(byRatingDesc).slice(0, 5);

        // 2️⃣ Xe máy điện
        const motorbike = products.filter(p => p.vehicleType === "Motorbike").slice(0, 6);

        // 3️⃣ Xe đạp điện
        let ecoBike = products.filter(p => p.tags?.includes("eco") || p.tags?.includes("student"));
        if (ecoBike.length < 6) {
            ecoBike = ecoBike.concat(products.filter(p => p.vehicleType === "Scooter" && !ecoBike.includes(p)));
        }
        ecoBike = ecoBike.slice(0, 6);

        // 4️⃣ Xe gấp gọn
        let compact = products.filter(p => p.tags?.includes("compact") || p.tags?.includes("foldable"));
        if (compact.length < 6) {
            compact = compact.concat(products.filter(p => p.vehicleType === "Scooter" && !compact.includes(p)));
        }
        compact = compact.slice(0, 6);

        // Render vào các container ID
        renderInto("topRentList", topRent);
        renderInto("motorbikeList", motorbike);
        renderInto("ecoBikeList", ecoBike);
        renderInto("compactBikeList", compact);

        // Banner khuyến mãi
        setupPromo();

    } catch (err) {
        console.error("❌ Lỗi load JSON:", err);
        ["topRentList", "motorbikeList", "ecoBikeList", "compactBikeList"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = `<p class="text-danger">Không tải được dữ liệu. Kiểm tra đường dẫn JSON hoặc Live Server.</p>`;
        });
    }
})();
