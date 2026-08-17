const form =
  document.getElementById("searchForm");

const input =
  document.getElementById("query");

const clearBtn =
  document.getElementById("clearBtn");

const suggestions =
  document.getElementById("suggestions");

const resultsSection =
  document.getElementById("resultsSection");

const results =
  document.getElementById("results");

const answer =
  document.getElementById("answer");

const statusBox =
  document.getElementById("status");

const fallback =
  document.getElementById("fallback");

const externalSearch =
  document.getElementById("externalSearch");

const backBtn =
  document.getElementById("backBtn");

const themeBtn =
  document.getElementById("themeBtn");


const HISTORY_KEY =
  "searchgg_history";

const THEME_KEY =
  "searchgg_theme";


function escapeHTML(text) {

  return String(text).replace(
    /[&<>"']/g,
    char => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    })[char]
  );

}


function setTheme(theme) {

  document.body.classList.toggle(
    "light",
    theme === "light"
  );

  themeBtn.textContent =
    theme === "light"
      ? "☀️"
      : "🌙";

  localStorage.setItem(
    THEME_KEY,
    theme
  );

}


setTheme(
  localStorage.getItem(THEME_KEY)
  || "dark"
);


themeBtn.addEventListener(
  "click",
  () => {

    setTheme(
      document.body.classList.contains("light")
        ? "dark"
        : "light"
    );

  }
);


function getHistory() {

  try {

    return JSON.parse(
      localStorage.getItem(HISTORY_KEY)
      || "[]"
    );

  } catch {

    return [];

  }

}


function saveHistory(query) {

  const history =
    getHistory().filter(
      item =>
        item.toLowerCase()
        !== query.toLowerCase()
    );

  history.unshift(query);

  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(
      history.slice(0, 10)
    )
  );

}


input.addEventListener(
  "input",
  () => {

    clearBtn.style.display =
      input.value
        ? "block"
        : "none";

    showSuggestions(
      input.value.trim()
    );

  }
);


clearBtn.addEventListener(
  "click",
  () => {

    input.value = "";

    clearBtn.style.display =
      "none";

    suggestions.innerHTML =
      "";

    input.focus();

  }
);


function showSuggestions(query) {

  if (!query) {

    suggestions.innerHTML =
      "";

    return;

  }


  const history =
    getHistory()
      .filter(
        item =>
          item.toLowerCase()
            .includes(
              query.toLowerCase()
            )
      )
      .slice(0, 5);


  suggestions.innerHTML =
    history.map(
      item => `
        <div class="suggestion">
          🔎 ${escapeHTML(item)}
        </div>
      `
    ).join("");


  document
    .querySelectorAll(".suggestion")
    .forEach(element => {

      element.addEventListener(
        "click",
        () => {

          const query =
            element.textContent
              .replace("🔎", "")
              .trim();

          input.value = query;

          search(query);

        }
      );

    });

}


document
  .querySelectorAll(
    ".quick-buttons button"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const query =
          button.dataset.query;

        input.value = query;

        search(query);

      }
    );

  });


form.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    search(input.value);

  }
);


async function search(query) {

  query = query.trim();

  if (!query)
    return;


  saveHistory(query);

  suggestions.innerHTML =
    "";


  resultsSection
    .classList
    .remove("hidden");


  results.innerHTML =
    "";

  answer.classList.add(
    "hidden"
  );

  fallback.classList.add(
    "hidden"
  );


  statusBox.textContent =
    "🔎 SearchGG szuka...";


  externalSearch.href =
    "https://duckduckgo.com/?q="
    + encodeURIComponent(query);


  try {

    const apiURL =
      "https://api.duckduckgo.com/"
      + "?q="
      + encodeURIComponent(query)
      + "&format=json"
      + "&no_html=1"
      + "&no_redirect=1";


    const response =
      await fetch(apiURL);


    if (!response.ok)
      throw new Error(
        "API error"
      );


    const data =
      await response.json();


    displayResults(
      data,
      query
    );


  } catch(error) {

    statusBox.textContent =
      "⚠️ Nie udało się pobrać danych.";

    fallback
      .classList
      .remove("hidden");

  }

}


function displayResults(
  data,
  query
) {

  const found = [];


  if (
    data.AbstractText
    || data.Abstract
  ) {

    const text =
      data.AbstractText
      || data.Abstract;


    const title =
      data.Heading
      || query;


    answer.innerHTML = `

      <h2>
        ${escapeHTML(title)}
      </h2>

      <p>
        ${escapeHTML(text)}
      </p>

      ${
        data.AbstractURL
          ? `
            <a
              href="${escapeHTML(
                data.AbstractURL
              )}"
              target="_blank"
              rel="noopener"
            >
              Źródło ↗
            </a>
          `
          : ""
      }

    `;


    answer.classList.remove(
      "hidden"
    );

  }


  function collect(items) {

    (items || [])
      .forEach(item => {

        if (item.Topics) {

          collect(
            item.Topics
          );

        }


        if (
          item.FirstURL
          && item.Text
        ) {

          found.push({

            title: item.Text,

            url: item.FirstURL

          });

        }

      });

  }


  collect(
    data.RelatedTopics
  );


  found
    .slice(0, 12)
    .forEach(item => {

      const article =
        document.createElement(
          "article"
        );


      article.className =
        "result";


      article.innerHTML = `

        <div class="result-url">
          ${escapeHTML(item.url)}
        </div>

        <a
          class="result-title"
          href="${escapeHTML(item.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHTML(item.title)}
        </a>

        <p class="result-description">
          Kliknij wynik, aby otworzyć
          pełną stronę.
        </p>

      `;


      results.appendChild(
        article
      );

    });


  statusBox.textContent =
    found.length
      ? `Wyniki dla „${query}”`
      : "Brak bezpośredniej odpowiedzi.";


  fallback
    .classList
    .remove("hidden");

}


backBtn.addEventListener(
  "click",
  () => {

    resultsSection
      .classList
      .add("hidden");

    input.focus();

  }
);


const params =
  new URLSearchParams(
    location.search
  );


const initialQuery =
  params.get("q");


if (initialQuery) {

  input.value =
    initialQuery;

  search(
    initialQuery
  );

    }
