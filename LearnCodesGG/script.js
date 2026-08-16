let currentLesson = 0;

function showLesson(number) {
    const lessons = document.querySelectorAll(".lesson");

    if (!lessons.length) return;

    if (number < 0) number = 0;
    if (number >= lessons.length) number = lessons.length - 1;

    lessons.forEach((lesson, index) => {
        lesson.style.display = index === number ? "block" : "none";
    });

    currentLesson = number;

    localStorage.setItem(
        "LearnCodesGG_" + location.pathname,
        currentLesson
    );

    const counter = document.getElementById("lessonCounter");

    if (counter) {
        counter.textContent =
            `Lekcja ${currentLesson + 1} / ${lessons.length}`;
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function nextLesson() {
    showLesson(currentLesson + 1);
}

function previousLesson() {
    showLesson(currentLesson - 1);
}

function copyCode(button) {
    const code = button.parentElement.querySelector(".code");

    if (!code) return;

    navigator.clipboard.writeText(code.innerText);

    const oldText = button.innerText;

    button.innerText = "✅ SKOPIOWANO!";

    setTimeout(() => {
        button.innerText = oldText;
    }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
    const lessons = document.querySelectorAll(".lesson");

    if (!lessons.length) return;

    const saved = localStorage.getItem(
        "LearnCodesGG_" + location.pathname
    );

    const savedLesson = saved !== null ? Number(saved) : 0;

    showLesson(savedLesson);
});
