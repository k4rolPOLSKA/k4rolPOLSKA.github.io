const problemInput = document.getElementById("problem");
const categoryInput = document.getElementById("category");
const fixButton = document.getElementById("fixButton");

const loading = document.getElementById("loading");
const result = document.getElementById("result");
const success = document.getElementById("success");

fixButton.addEventListener("click", analyzeProblem);

async function analyzeProblem() {

    const problem = problemInput.value.trim();
    const category = categoryInput.value;

    if (!problem) {
        alert("Najpierw opisz swój problem 🔍");
        return;
    }

    result.classList.add("hidden");
    success.classList.add("hidden");
    loading.classList.remove("hidden");

    window.scrollTo({
        top: loading.offsetTop - 50,
        behavior: "smooth"
    });

    try {

        const response = await fetch("/api/fix", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                problem,
                category
            })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Wystąpił błąd.");
        }

        showResult(data);

    } catch (error) {

        alert("❌ " + error.message);

    } finally {

        loading.classList.add("hidden");

    }
}


function showResult(data) {

    document.getElementById("diagnosis").textContent =
        data.diagnosis || "Nie udało się określić problemu.";

    const causes = document.getElementById("causes");

    causes.innerHTML = "";

    (data.causes || []).forEach(cause => {

        const div = document.createElement("div");

        div.className = "cause";
        div.textContent = "• " + cause;

        causes.appendChild(div);

    });


    const steps = document.getElementById("steps");

    steps.innerHTML = "";

    (data.steps || []).forEach((step, index) => {

        const div = document.createElement("div");

        div.className = "step";

        div.innerHTML = `
            <div class="step-number">${index + 1}</div>
            <div>${escapeHTML(step)}</div>
        `;

        steps.appendChild(div);

    });


    document.getElementById("warning").textContent =
        data.warning ||
        "Jeżeli nie jesteś pewien, co robisz, przerwij i poproś o pomoc.";

    result.classList.remove("hidden");

    window.scrollTo({
        top: result.offsetTop - 30,
        behavior: "smooth"
    });
}


function problemSolved() {

    result.classList.add("hidden");
    success.classList.remove("hidden");

    window.scrollTo({
        top: success.offsetTop - 30,
        behavior: "smooth"
    });

}


function tryAgain() {

    const oldProblem = problemInput.value;

    problemInput.value =
        oldProblem +
        "\n\nPoprzednia metoda nie zadziałała. Podaj inne rozwiązanie i kolejny krok diagnostyczny.";

    analyzeProblem();

}


function resetOnFix() {

    problemInput.value = "";

    success.classList.add("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

          }
