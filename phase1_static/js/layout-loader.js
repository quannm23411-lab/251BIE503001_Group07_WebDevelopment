fetch("../../components/header.html")
    .then(res => res.text())
    .then(html => {
        document.getElementById("header").innerHTML = html;

        // Gắn file CSS + JS riêng cho header
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "../../css/header.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "../../js/header.js";
        document.body.appendChild(script);
    });


fetch("../../components/footer.html")
    .then(res => res.text())
    .then(data => document.getElementById("footer").innerHTML = data);
