"use strict";

/*
  OnWeather 4.1 PRO
  API: Open-Meteo
*/

const API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";

let locationData = {
  name: "Połomia",
  country: "Polska",
  latitude: 50.0397,
  longitude: 18.5714,
  timezone: "Europe/Warsaw"
};

let weatherData = null;


// ===============================
// ELEMENTY
// ===============================

const $ = id => document.getElementById(id);


// ===============================
// START
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  loadSavedLocation();

  $("refreshBtn").addEventListener("click", () => {
    loadWeather();
  });

  $("locationBtn").addEventListener("click", () => {
    $("locationModal").classList.remove("hidden");
    $("cityInput").focus();
  });

  $("closeModal").addEventListener("click", closeModal);

  $("searchCity").addEventListener("click", searchCity);

  $("cityInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      searchCity();
    }
  });

  $("gpsBtn").addEventListener("click", useGPS);

  $("settingsBtn").addEventListener("click", () => {
    alert(
      "OnWeather 4.1 PRO\n\n" +
      "🌦️ Dane: Open-Meteo\n" +
      "📅 Prognoza: 14 dni\n" +
      "⏰ Prognoza godzinowa\n" +
      "📍 Lokalizacja\n" +
      "🌧️ Opady i szansa opadu\n" +
      "💨 Wiatr i porywy\n" +
      "☀️ UV\n" +
      "🌅 Wschód i zachód"
    );
  });

  loadWeather();
});


// ===============================
// ZAPIS LOKALIZACJI
// ===============================

function loadSavedLocation() {

  try {

    const saved = localStorage.getItem("onweather-location");

    if (saved) {
      locationData = JSON.parse(saved);
    }

  } catch (error) {

    console.log("Brak zapisanej lokalizacji.");

  }

}


// ===============================
// POBIERANIE POGODY
// ===============================

async function loadWeather() {

  setStatus("🌐 Pobieranie aktualnych danych pogodowych...");

  updateLocationUI();

  try {

    const params = new URLSearchParams({

      latitude: locationData.latitude,
      longitude: locationData.longitude,

      timezone: "auto",

      forecast_days: "14",

      temperature_unit: "celsius",

      wind_speed_unit: "kmh",

      precipitation_unit: "mm",

      current: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "is_day",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "pressure_msl",
        "surface_pressure",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m"
      ].join(","),

      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "dew_point_2m",
        "precipitation_probability",
        "precipitation",
        "rain",
        "showers",
        "snowfall",
        "weather_code",
        "cloud_cover",
        "visibility",
        "pressure_msl",
        "wind_speed_10m",
        "wind_direction_10m",
        "wind_gusts_10m",
        "uv_index",
        "is_day"
      ].join(","),

      daily: [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "apparent_temperature_min",
        "sunrise",
        "sunset",
        "daylight_duration",
        "precipitation_sum",
        "rain_sum",
        "showers_sum",
        "snowfall_sum",
        "precipitation_probability_max",
        "wind_speed_10m_max",
        "wind_gusts_10m_max",
        "uv_index_max"
      ].join(",")

    });

    const response = await fetch(`${API}?${params.toString()}`);

    if (!response.ok) {
      throw new Error("API HTTP " + response.status);
    }

    const data = await response.json();

    if (!data.current || !data.hourly || !data.daily) {
      throw new Error("API nie zwróciło wymaganych danych.");
    }

    weatherData = data;

    renderCurrent(data);
    renderHourly(data);
    renderDaily(data);
    renderDetails(data);

    setStatus(
      "🟢 Dane aktualne • " +
      new Date().toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );

  } catch (error) {

    console.error(error);

    setStatus(
      "🔴 Nie udało się pobrać pogody. " +
      "Sprawdź internet i odśwież stronę."
    );

  }

}


// ===============================
// LOKALIZACJA UI
// ===============================

function updateLocationUI() {

  $("locationName").textContent =
    locationData.name || "Nieznana lokalizacja";

  $("countryName").textContent =
    locationData.country || "";

  $("coordinates").textContent =
    `${Number(locationData.latitude).toFixed(2)}°N, ` +
    `${Number(locationData.longitude).toFixed(2)}°E`;
}


// ===============================
// AKTUALNA POGODA
// ===============================

function renderCurrent(data) {

  const c = data.current;

  $("temperature").textContent =
    `${round(c.temperature_2m)}°`;

  $("feelsLike").textContent =
    `${round(c.apparent_temperature)}°C`;

  $("weatherDescription").textContent =
    weatherDescription(c.weather_code);

  $("weatherIcon").textContent =
    weatherIcon(c.weather_code, c.is_day);

  $("humidity").textContent =
    `${round(c.relative_humidity_2m)}%`;

  $("wind").textContent =
    `${round(c.wind_speed_10m)} km/h`;

  $("gusts").textContent =
    `${round(c.wind_gusts_10m)} km/h`;

  $("windDirection").textContent =
    `${directionName(c.wind_direction_10m)} ${round(c.wind_direction_10m)}°`;

  $("clouds").textContent =
    `${round(c.cloud_cover)}%`;

  $("rain").textContent =
    `${num(c.precipitation)} mm`;

  $("pressure").textContent =
    `${round(c.pressure_msl)} hPa`;

  $("dayNight").textContent =
    Number(c.is_day) === 1 ? "Dzień ☀️" : "Noc 🌙";

  const currentHourIndex =
    findCurrentHourIndex(data.hourly.time);

  if (currentHourIndex >= 0) {

    const h = data.hourly;

    $("dewpoint").textContent =
      `${round(h.dew_point_2m[currentHourIndex])}°C`;

    $("visibility").textContent =
      `${num(h.visibility[currentHourIndex] / 1000)} km`;

    const chance =
      h.precipitation_probability[currentHourIndex];

    $("rainChance").textContent =
      rainChanceText(
        chance,
        h.precipitation[currentHourIndex],
        h.rain[currentHourIndex],
        h.showers[currentHourIndex],
        h.snowfall[currentHourIndex]
      );

    $("uv").textContent =
      round(h.uv_index[currentHourIndex]);

    $("updateTime").textContent =
      formatTime(h.time[currentHourIndex]);

  }

  if (data.daily.sunrise?.[0]) {

    $("sunrise").textContent =
      formatTime(data.daily.sunrise[0]);

  }

  if (data.daily.sunset?.[0]) {

    $("sunset").textContent =
      formatTime(data.daily.sunset[0]);

  }

}


// ===============================
// GODZINOWA
// ===============================

function renderHourly(data) {

  const container = $("hourly");

  container.innerHTML = "";

  const h = data.hourly;

  const currentIndex =
    findCurrentHourIndex(h.time);

  const start =
    Math.max(currentIndex, 0);

  const end =
    Math.min(start + 24, h.time.length);

  for (let i = start; i < end; i++) {

    const card = document.createElement("div");

    card.className =
      "hour-card" +
      (i === start ? " current" : "");

    const rainText =
      rainChanceText(
        h.precipitation_probability[i],
        h.precipitation[i],
        h.rain[i],
        h.showers[i],
        h.snowfall[i]
      );

    card.innerHTML = `

      <div class="hour-time">
        ${formatTime(h.time[i])}
      </div>

      <div class="hour-icon">
        ${weatherIcon(
          h.weather_code[i],
          h.is_day[i]
        )}
      </div>

      <div class="hour-temp">
        ${round(h.temperature_2m[i])}°C
      </div>

      <div class="hour-rain">
        ${rainText}
      </div>

      <div>
        💨 ${round(h.wind_speed_10m[i])}
      </div>

    `;

    container.appendChild(card);
  }

}


// ===============================
// 14 DNI
// ===============================

function renderDaily(data) {

  const container = $("daily");

  container.innerHTML = "";

  const d = data.daily;

  for (let i = 0; i < d.time.length; i++) {

    const card = document.createElement("div");

    card.className = "day-card";

    const rainChance =
      d.precipitation_probability_max[i];

    const precipitation =
      d.precipitation_sum[i];

    card.innerHTML = `

      <div>
        <div class="day-name">
          ${dayName(d.time[i], i)}
        </div>

        <span class="day-date">
          ${formatDate(d.time[i])}
        </span>
      </div>

      <div class="day-weather">
        ${weatherIcon(
          d.weather_code[i],
          1
        )}
      </div>

      <div class="day-temp">
        🔥 ${round(d.temperature_2m_max[i])}°C
        <br>
        🧊 ${round(d.temperature_2m_min[i])}°C
      </div>

      <div class="day-rain">
        ${rainChanceTextDaily(
          rainChance,
          precipitation
        )}
      </div>

      <div class="day-wind">
        💨 ${round(d.wind_speed_10m_max[i])} km/h
      </div>

    `;

    container.appendChild(card);
  }

}


// ===============================
// SZCZEGÓŁY
// ===============================

function renderDetails(data) {

  const d = data.daily;

  $("maxTemp").textContent =
    `${round(d.temperature_2m_max[0])}°C`;

  $("minTemp").textContent =
    `${round(d.temperature_2m_min[0])}°C`;

  $("totalRain").textContent =
    `${num(d.precipitation_sum[0])} mm`;

  $("dayLength").textContent =
    formatDuration(d.daylight_duration[0]);

}


// ===============================
// SZANSA DESZCZU
// ===============================

function rainChanceText(
  probability,
  precipitation,
  rain,
  showers,
  snowfall
) {

  const p = Number(probability) || 0;

  const amount =
    (Number(precipitation) || 0) +
    (Number(rain) || 0) +
    (Number(showers) || 0);

  const snow =
    Number(snowfall) || 0;

  /*
    WAŻNE:
    Nie pokazujemy np. 0% jako "deszcz",
    jeżeli faktycznie nie ma opadu.
  */

  if (amount <= 0 && snow <= 0 && p <= 0) {
    return "☀️ Brak opadu";
  }

  if (snow > 0) {
    return `❄️ ${p}%`;
  }

  if (amount > 0 || p > 0) {
    return `🌧️ ${p}%`;
  }

  return "☀️ Brak opadu";
}


function rainChanceTextDaily(probability, precipitation) {

  const p = Number(probability) || 0;
  const rain = Number(precipitation) || 0;

  if (rain <= 0 && p <= 0) {
    return "☀️ Bez opadów";
  }

  return `🌧️ ${p}%<br>${num(rain)} mm`;
}


// ===============================
// WYSZUKIWANIE MIASTA
// ===============================

async function searchCity() {

  const input =
    $("cityInput").value.trim();

  if (input.length < 2) {
    alert("Wpisz nazwę miasta.");
    return;
  }

  $("searchResults").innerHTML =
    `<div class="loading">🔎 Szukanie...</div>`;

  try {

    const params = new URLSearchParams({

      name: input,

      count: 8,

      language: "pl",

      format: "json"

    });

    const response =
      await fetch(`${GEO_API}?${params}`);

    if (!response.ok) {
      throw new Error("Błąd geokodowania.");
    }

    const data =
      await response.json();

    if (!data.results || data.results.length === 0) {

      $("searchResults").innerHTML =
        `<div class="loading">
          ❌ Nie znaleziono miejscowości.
        </div>`;

      return;
    }

    $("searchResults").innerHTML = "";

    data.results.forEach(place => {

      const div =
        document.createElement("div");

      div.className = "result";

      div.innerHTML = `

        <strong>
          ${escapeHTML(place.name)}
        </strong>

        <div style="color:#8fa6b8;margin:5px 0 10px;">
          ${escapeHTML(place.admin1 || "")}
          ${place.country ? ", " + escapeHTML(place.country) : ""}
        </div>

        <button>
          Wybierz
        </button>

      `;

      div.querySelector("button")
        .addEventListener("click", () => {

          selectLocation(place);

        });

      $("searchResults")
        .appendChild(div);

    });

  } catch (error) {

    console.error(error);

    $("searchResults").innerHTML =
      `<div class="loading">
        ❌ Błąd wyszukiwania.
      </div>`;

  }

}


// ===============================
// WYBÓR LOKALIZACJI
// ===============================

function selectLocation(place) {

  locationData = {

    name: place.name,

    country: place.country || "",

    latitude: place.latitude,

    longitude: place.longitude,

    timezone:
      place.timezone || "auto"

  };

  localStorage.setItem(
    "onweather-location",
    JSON.stringify(locationData)
  );

  updateLocationUI();

  closeModal();

  loadWeather();

}


// ===============================
// GPS
// ===============================

function useGPS() {

  if (!navigator.geolocation) {

    alert(
      "Twoja przeglądarka nie obsługuje GPS."
    );

    return;
  }

  $("gpsBtn").textContent =
    "📡 Pobieranie lokalizacji...";

  navigator.geolocation.getCurrentPosition(

    async position => {

      const lat =
        position.coords.latitude;

      const lon =
        position.coords.longitude;

      locationData = {

        name: "Moja lokalizacja",

        country: "",

        latitude: lat,

        longitude: lon,

        timezone: "auto"

      };

      localStorage.setItem(
        "onweather-location",
        JSON.stringify(locationData)
      );

      closeModal();

      updateLocationUI();

      await loadWeather();

      $("gpsBtn").textContent =
        "📍 Użyj mojej lokalizacji";

    },

    error => {

      console.error(error);

      alert(
        "Nie udało się pobrać lokalizacji. " +
        "Sprawdź, czy GPS jest włączony."
      );

      $("gpsBtn").textContent =
        "📍 Użyj mojej lokalizacji";

    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }

  );

}


// ===============================
// MODAL
// ===============================

function closeModal() {

  $("locationModal")
    .classList
    .add("hidden");

}


// ===============================
// KODY POGODOWE WMO
// ===============================

function weatherDescription(code) {

  code = Number(code);

  if (code === 0)
    return "Bezchmurnie";

  if (code === 1)
    return "Głównie bezchmurnie";

  if (code === 2)
    return "Częściowe zachmurzenie";

  if (code === 3)
    return "Pochmurno";

  if ([45, 48].includes(code))
    return "Mgła";

  if ([51,53,55].includes(code))
    return "Mżawka";

  if ([56,57].includes(code))
    return "Marznąca mżawka";

  if ([61,63,65].includes(code))
    return "Deszcz";

  if ([66,67].includes(code))
    return "Marznący deszcz";

  if ([71,73,75,77].includes(code))
    return "Śnieg";

  if ([80,81,82].includes(code))
    return "Przelotne opady";

  if ([85,86].includes(code))
    return "Przelotny śnieg";

  if ([95].includes(code))
    return "Burza";

  if ([96,99].includes(code))
    return "Burza z gradem";

  return "Warunki pogodowe";
}


function weatherIcon(code, isDay) {

  code = Number(code);

  const day =
    Number(isDay) === 1;

  if (code === 0)
    return day ? "☀️" : "🌙";

  if (code === 1)
    return day ? "🌤️" : "🌙";

  if (code === 2)
    return day ? "⛅" : "☁️";

  if (code === 3)
    return "☁️";

  if ([45,48].includes(code))
    return "🌫️";

  if ([51,53,55,56,57].includes(code))
    return "🌦️";

  if ([61,63,65,66,67].includes(code))
    return "🌧️";

  if ([71,73,75,77,85,86].includes(code))
    return "🌨️";

  if ([80,81,82].includes(code))
    return "🌦️";

  if ([95,96,99].includes(code))
    return "⛈️";

  return "🌤️";
}


// ===============================
// KIERUNEK WIATRU
// ===============================

function directionName(degrees) {

  const dirs = [
    "N",
    "NE",
    "E",
    "SE",
    "S",
    "SW",
    "W",
    "NW"
  ];

  const index =
    Math.round(Number(degrees) / 45) % 8;

  return dirs[index] || "--";
}


// ===============================
// CZAS
// ===============================

function formatTime(value) {

  if (!value) {
    return "--:--";
  }

  return String(value)
    .split("T")[1]
    ?.slice(0, 5) || "--:--";
}


function formatDate(value) {

  if (!value) {
    return "";
  }

  const d =
    new Date(value + "T12:00:00");

  return d.toLocaleDateString(
    "pl-PL",
    {
      day: "2-digit",
      month: "2-digit"
    }
  );
}


function dayName(value, index) {

  if (index === 0) {
    return "Dzisiaj";
  }

  if (index === 1) {
    return "Jutro";
  }

  const d =
    new Date(value + "T12:00:00");

  return d.toLocaleDateString(
    "pl-PL",
    {
      weekday: "long"
    }
  );
}


function formatDuration(seconds) {

  const total =
    Math.round(Number(seconds) || 0);

  const hours =
    Math.floor(total / 3600);

  const minutes =
    Math.floor((total % 3600) / 60);

  return `${hours} h ${minutes} min`;
}


// ===============================
// POMOCNICZE
// ===============================

function round(value) {

  if (
    value === undefined ||
    value === null ||
    Number.isNaN(Number(value))
  ) {
    return "--";
  }

  return Math.round(Number(value));
}


function num(value) {

  if (
    value === undefined ||
    value === null ||
    Number.isNaN(Number(value))
  ) {
    return "0";
  }

  return Number(value)
    .toFixed(1)
    .replace(".0", "");
}


function findCurrentHourIndex(times) {

  const now =
    new Date();

  let bestIndex = 0;
  let bestDiff = Infinity;

  for (let i = 0; i < times.length; i++) {

    const date =
      new Date(times[i]);

    const diff =
      Math.abs(date.getTime() - now.getTime());

    if (diff < bestDiff) {

      bestDiff = diff;
      bestIndex = i;

    }

  }

  return bestIndex;
}


function setStatus(text) {

  $("status").textContent = text;

}


function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

            }
