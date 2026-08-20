document.addEventListener("DOMContentLoaded", () => {

    // Rok w stopce
    document.querySelectorAll(".year").forEach(element => {
        element.textContent = new Date().getFullYear();
    });

    // Wyszukiwarka
    const search = document.querySelector("#siteSearch");

    if (search) {
        search.addEventListener("input", () => {

            const query = search.value.toLowerCase().trim();

            document.querySelectorAll("[data-search]").forEach(element => {

                const text = element.dataset.search.toLowerCase();

                if (text.includes(query)) {
                    element.style.display = "";
                } else {
                    element.style.display = "none";
                }

            });
        });
    }

    // Formularz kontaktowy
    const contactForm = document.querySelector("#contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const message = document.querySelector("#formMsg");

            if (message) {
                message.textContent =
                    "💗 Dziękujemy! Wiadomość została przygotowana.";
            }

            contactForm.reset();

        });
    }

    // Generator imion
    const nameButton = document.querySelector("#nameBtn");

    if (nameButton) {

        nameButton.addEventListener("click", () => {

            const names = [
                "Luna",
                "Milo",
                "Kicia",
                "Filemon",
                "Figa",
                "Puszek",
                "Leo",
                "Nala",
                "Coco",
                "Pixel",
                "Bella",
                "Misia",
                "Tofik",
                "Kropka",
                "Simba",
                "Mimi"
            ];

            const randomName =
                names[Math.floor(Math.random() * names.length)];

            const result = document.querySelector("#catName");

            if (result) {
                result.textContent = randomName + " 🐱";
            }

        });

    }

});
