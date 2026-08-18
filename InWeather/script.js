const API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";

let currentLocation = {
  name: "Warszawa",
  country: "Polska",
  latitude: 52.2297,
  longitude: 21.0122
};

const $ = id => document.getElementById(id);

const weatherCodes = {
  0: ["☀️", "Bezchmurnie"],
  1: ["🌤️", "Głównie bezchmurnie"],
  2: ["⛅", "Częściowe zachmurzenie"],
  3: ["☁️", "Pochmurno"],
  45: ["🌫️", "Mgła"],
  48: ["🌫️", "Osadzająca się mgła"],
  51: ["🌦️", "Lekka mżawka"],
  53: ["🌦️", "Mżawka"],
  55: ["🌧️", "Silna mżawka"],
  56: ["🌧️", "Lekka marznąca mżawka"],
  57: ["🌧️", "Silna marznąca mżawka"],
  61: ["🌦️", "Lekki deszcz"],
  63: ["🌧️", "Deszcz"],
  65: ["🌧️", "Silny deszcz"],
  66: ["🌧️", "Lekki marznący deszcz"],
  67: ["🌧️", "Silny marznący deszcz"],
  71: ["🌨️", "Lekki śnieg"],
  73: ["❄️", "Śnieg"],
  75: ["❄️", "Silny śnieg"],
  77: ["🌨️", "Śnieg ziarnisty"],
  80: ["🌦️", "Przelotne opady"],
  81: ["🌧️", "Przelotny deszcz"],
  82: ["🌧️", "Silne przelotne opady"],
  85: ["🌨️", "Przelotny śnieg"],
  86: ["❄️", "Silne przelotne opady śniegu"],
  95: ["⛈️", "Burza"],
  96: ["⛈️", "Burza z gradem"],
  99: ["⛈️", "Silna burza z gradem"]
};

function getWeather(code) {
  return weatherCodes[code] || ["🌡️", "Nieznana pogoda"];
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatHour(time) {
  return new Date(time).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDay(time) {
  return new Date(time).toLocaleDateString("pl-PL", {
    weekday: "long"
  });
}

function formatDate(time) {
  return new Date(time).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit"
  });
}

function windDirection(deg) {
  const directions = [
    "N", "NE", "E", "SE",
    "S", "SW", "W", "NW"
  ];

  return directions[Math.round(deg / 45) % 8];
}

async function getWeather(lat, lon, locationName, country) {

  $("loading").classList.remove("hidden");
  $("app").classList.add("hidden");

  try {

    const url =
      `${API}?latitude=${lat}` +
      `&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,rain,weather_code,cloud_cover,relative_humidity_2m,wind_speed_10m,wind_gusts_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max` +
      `&forecast_days=14` +
      `&timezone=auto` +
      `&temperature_unit=celsius` +
      `&wind_speed_unit=kmh` +
      `&precipitation_unit=mm`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Błąd API");
    }

    const data = await response.json();

    currentLocation = {
      name: locationName,
      country: country,
      latitude: lat,
      longitude: lon
    };

    renderCurrent(data);
    renderHourly(data);
    renderDaily(data);
    renderProbabilities(data);
    renderSun(data);

    $("loading").classList.add("hidden");
    $("app").classList.remove("hidden");

  } catch (error) {

    $("loading").innerHTML = `
      <div style="font-size:50px">⚠️</div>
      <h2>Nie udało się pobrać pogody</h2>
      <p>Sprawdź połączenie z internetem i spróbuj ponownie.</p>
    `;

    console.error(error);
  }
}

function renderCurrent(data) {

  const c = data.current;
  const d = data.daily;

  const [icon, description] = getWeather(c.weather_code);

  $("cityName").textContent = currentLocation.name;
  $("countryName").textContent = currentLocation.country;

  $("currentIcon").textContent = icon;
  $("currentTemp").textContent = `${Math.round(c.temperature_2m)}°`;
  $("weatherDescription").textContent = description;

  $("feelsLike").textContent =
    `${Math.round(c.apparent_temperature)}°C`;

  $("todayMinMax").textContent =
    `${Math.round(d.temperature_2m_min[0])}° / ${Math.round(d.temperature_2m_max[0])}°`;

  $("rainChance").textContent =
    `${d.precipitation_probability_max[0] ?? 0}%`;

  $("windSpeed").textContent =
    `${Math.round(c.wind_speed_10m)} km/h`;

  $("humidity").textContent =
    `${Math.round(c.relative_humidity_2m)}%`;

  $("detailFeels").textContent =
    `${Math.round(c.apparent_temperature)}°C`;

  $("detailHumidity").textContent =
    `${Math.round(c.relative_humidity_2m)}%`;

  $("pressure").textContent =
    `${Math.round(c.pressure_msl)} hPa`;

  $("clouds").textContent =
    `${Math.round(c.cloud_cover)}%`;

  $("visibility").textContent =
    `${(c.visibility / 1000).toFixed(1)} km`;

  $("gusts").textContent =
    `${Math.round(c.wind_gusts_10m)} km/h`;

  $("windDirection").textContent =
    `${windDirection(c.wind_direction_10m)} (${Math.round(c.wind_direction_10m)}°)`;

  $("precipitation").textContent =
    `${Number(c.precipitation || 0).toFixed(1)} mm`;

  $("lastUpdate").textContent =
    `Ostatnia aktualizacja: ${new Date().toLocaleTimeString("pl-PL")}`;
}

function renderProbabilities(data) {

  const d = data.daily;
  const h = data.hourly;

  const rain = clamp(d.precipitation_probability_max[0] || 0);

  const todayCodes = h.weather_code.slice(0, 24);
  const todayClouds = h.cloud_cover.slice(0, 24);

  const averageCloud =
    todayClouds.reduce((a, b) => a + b, 0) /
    todayClouds.length;

  const sunnyHours =
    todayCodes.filter(code => [0, 1].includes(code)).length;

  const stormHours =
    todayCodes.filter(code => [95, 96, 99].includes(code)).length;

  const sun = clamp(
    (sunnyHours / Math.max(todayCodes.length, 1)) * 100
  );

  const cloud = clamp(averageCloud);

  const storm = clamp(
    (stormHours / Math.max(todayCodes.length, 1)) * 100
  );

  setProbability("rain", rain);
  setProbability("sun", sun);
  setProbability("cloud", cloud);
  setProbability("storm", storm);
}

function setProbability(name, value) {
  $(`${name}Probability`).textContent = `${value}%`;
  $(`${name}Bar`).style.width = `${value}%`;
}

function renderHourly(data) {

  const h = data.hourly;

  const now = new Date();

  let startIndex = 0;

  for (let i = 0; i < h.time.length; i++) {
    if (new Date(h.time[i]) >= now) {
      startIndex = i;
      break;
    }
  }

  const end = Math.min(startIndex + 24, h.time.length);

  let html = "";

  for (let i = startIndex; i < end; i++) {

    const [icon] = getWeather(h.weather_code[i]);

    html += `
      <div class="hour-card ${i === startIndex ? "current" : ""}">
        <div class="hour-time">
          ${i === startIndex ? "TERAZ" : formatHour(h.time[i])}
        </div>

        <div class="hour-icon">${icon}</div>

        <div class="hour-temp">
          ${Math.round(h.temperature_2m[i])}°
        </div>

        <div class="hour-rain">
          🌧️ ${h.precipitation_probability[i] ?? 0}%
        </div>

        <div class="hour-rain">
          💨 ${Math.round(h.wind_speed_10m[i])} km/h
        </div>
      </div>
    `;
  }

  $("hourlyForecast").innerHTML = html;
}

function renderDaily(data) {

  const d = data.daily;

  let html = "";

  for (let i = 0; i < 14; i++) {

    const [icon, description] =
      getWeather(d.weather_code[i]);

    html += `
      <div class="day-card">

        <div>
          <div class="day-name">
            ${i === 0 ? "Dzisiaj" : formatDay(d.time[i])}
          </div>
          <div class="day-date">
            ${formatDate(d.time[i])}
          </div>
        </div>

        <div class="day-icon">${icon}</div>

        <div class="day-description">
          ${description}
        </div>

        <div class="day-temp">
          ${Math.round(d.temperature_2m_max[i])}° /
          ${Math.round(d.temperature_2m_min[i])}°
        </div>

        <div class="day-rain">
          🌧️ ${d.precipitation_probability_max[i] ?? 0}%
        </div>

      </div>
    `;
  }

  $("dailyForecast").innerHTML = html;
}

function renderSun(data) {

  $("sunrise").textContent =
    formatHour(data.daily.sunrise[0]);

  $("sunset").textContent =
    formatHour(data.daily.sunset[0]);
}

async function searchLocation() {

  const query = $("searchInput").value.trim();

  if (query.length < 2) {
    $("searchResults").innerHTML = "";
    return;
  }

  try {

    const url =
      `${GEO_API}?name=${encodeURIComponent(query)}` +
      `&count=8&language=pl&format=json`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      $("searchResults").innerHTML =
        `<div class="search-result">❌ Nie znaleziono miejscowości.</div>`;
      return;
    }

    $("searchResults").innerHTML =
      data.results.map(place => `
        <div
          class="search-result"
          data-lat="${place.latitude}"
          data-lon="${place.longitude}"
          data-name="${place.name}"
          data-country="${place.country || ""}"
        >
          📍 <strong>${place.name}</strong>
          <br>
          <small>
            ${place.admin1 ? place.admin1 + ", " : ""}
            ${place.country || ""}
          </small>
        </div>
      `).join("");

  } catch (error) {
    console.error(error);
  }
}

$("searchBtn").addEventListener("click", searchLocation);

$("searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    searchLocation();
  }
});

$("searchResults").addEventListener("click", event => {

  const result =
    event.target.closest(".search-result");

  if (!result || !result.dataset.lat) return;

  const lat = result.dataset.lat;
  const lon = result.dataset.lon;
  const name = result.dataset.name;
  const country = result.dataset.country;

  $("searchResults").innerHTML = "";
  $("searchInput").value = name;

  getWeather(lat, lon, name, country);
});

$("locationBtn").addEventListener("click", () => {

  if (!navigator.geolocation) {
    alert("Twoja przeglądarka nie obsługuje lokalizacji.");
    return;
  }

  $("loading").classList.remove("hidden");
  $("app").classList.add("hidden");

  navigator.geolocation.getCurrentPosition(

    position => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      getWeather(
        lat,
        lon,
        "Moja lokalizacja",
        "Polska"
      );
    },

    () => {

      alert(
        "Nie udało się pobrać lokalizacji. Sprawdź uprawnienia GPS."
      );

      $("loading").classList.add("hidden");
    }
  );
});

// START
getWeather(
  currentLocation.latitude,
  currentLocation.longitude,
  currentLocation.name,
  currentLocation.country
);
