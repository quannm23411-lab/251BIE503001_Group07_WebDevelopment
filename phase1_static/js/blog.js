// ===== LOAD BLOG POSTS =====
fetch("../../../data/blog.json")
    .then((res) => res.json())
    .then((data) => {
        const list = document.getElementById("blogList");
        const filter = document.getElementById("categoryFilter");

        function renderBlogs(category = "") {
            list.innerHTML = "";
            const filtered = category
                ? data.filter((b) => b.category === category)
                : data;

            filtered.forEach((post) => {
                const card = document.createElement("div");
                card.className = "blog-card";
                card.innerHTML = `
          <img src="${post.image}" alt="${post.title}">
          <div class="content">
            <div class="category">${post.category}</div>
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
          </div>
        `;

                card.addEventListener("click", () => {
                    // Lưu ID bài viết để load ở trang chi tiết
                    localStorage.setItem("selectedBlogId", post.id);
                    window.location.href = "../../pages/client/blog-detail.html";
                });

                list.appendChild(card);
            });
        }

        // Khởi tạo danh sách ban đầu
        renderBlogs();

        // Bộ lọc
        filter.addEventListener("change", (e) => {
            renderBlogs(e.target.value);
        });
    });
