// ===============================
// COUNTDOWN BANNER
// ===============================
const countdownDate = new Date("Oct 31, 2025 23:59:59").getTime();

setInterval(() => {
    const now = new Date().getTime();
    const distance = countdownDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = days.toString().padStart(2, "0");
    document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
}, 1000);

// ===============================
// SUBSCRIBE FORM
// ===============================
const subscribeForm = document.getElementById("subscribeForm");

subscribeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = subscribeForm.querySelector("input").value.trim();

    if (email) {
        alert(`🎉 Cảm ơn bạn đã đăng ký nhận tin, ${email}!`);
        subscribeForm.reset();
    }
});
