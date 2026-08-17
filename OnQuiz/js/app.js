document.addEventListener("DOMContentLoaded", () => {
    console.log("OnQuiz uruchomiony 🚀");

    const links = document.querySelectorAll("a");

    links.forEach(link => {
        link.addEventListener("click", () => {
            document.body.classList.add("loading");
        });
    });
});
