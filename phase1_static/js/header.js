// === ECO MOVE - SIMPLE SHRINK HEADER ===
const header = document.getElementById("mainHeader");

window.addEventListener("scroll", () => {
    if (window.scrollY > 120) {
        header.classList.add("shrink");
    } else {
        header.classList.remove("shrink");
    }
});
