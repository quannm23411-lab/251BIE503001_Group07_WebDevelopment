// ===== LOAD CHI TIẾT BÀI VIẾT =====
fetch("../../data/blog.json")
    .then((res) => res.json())
    .then((data) => {
        const id = localStorage.getItem("selectedBlogId");
        const post = data.find((b) => b.id == id);

        if (post) {
            document.getElementById("blogImage").src = post.image;
            document.getElementById("blogTitle").textContent = post.title;
            document.getElementById("blogCategory").textContent = post.category.toUpperCase();
            document.getElementById("blogBody").innerHTML = post.content;
        } else {
            document.querySelector(".blog-detail__content").innerHTML =
                "<p>Không tìm thấy bài viết.</p>";
        }
    });
