const GEO_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


const weatherCodes = {

    0: ["Bezchmurnie", "☀️"],
    1: ["Przeważnie bezchmurnie", "🌤️"],
    2: ["Częściowe zachmurzenie", "⛅"],
    3: ["Pochmurno", "☁️"],

    45: ["Mgła", "🌫️"],
    48: ["Osadzająca się mgła", "🌫️"],

    51: ["Lekka mżawka", "🌦️"],
    53: ["Mżawka", "🌦️"],
    55: ["Silna mżawka", "🌧️"],

    56: ["Lekka marznąca mżawka", "🌧️"],
    57: ["Silna marznąca mżawka", "🌧️"],

    61: ["Lekki deszcz", "🌦️"],
    63: ["Deszcz", "🌧️"],
    65: ["Silny deszcz", "🌧️"],

    66: ["Lekki marznący deszcz", "🌧️"],
    67: ["Silny marznący deszcz", "🌧️"],

    71: ["Lekki śnieg", "🌨️"],
    73: ["Śnieg", "❄️"],
    75: ["Silny śnieg", "❄️"],

    77: ["Śnieg ziarnisty", "🌨️"],

    80: ["Przelotne opady", "🌦️"],
    81: ["Przelotny deszcz", "🌧️"],
    82: ["Silne opady", "⛈️"],

    85: ["Przelotny śnieg", "🌨️"],
    86: ["Silny przelotny śnieg", "❄️"],

    95: ["Burza", "⛈️"],
    96: ["Burza z gradem", "⛈️"],
    99: ["Silna burza z gradem", "⛈️"]
};


let weatherData = null;
let currentPlace = null;


function info(code) {

    return weatherCodes[code] ||
        ["Nieznana pogoda", "🌡️"];

}


function formatTime(value) {

    return new Date(value).toLocaleTimeString(
        "pl-PL",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatDate(value) {

    return new Date(value).toLocaleDateString(
        "pl-PL",
        {
            weekday: "long",
            day: "numeric",
            month: "long"
        }
    );

}


function shortDate(value) {

    return new Date(value).toLocaleDateString(
        "pl-PL",
        {
            day: "numeric",
            month: "short"
        }
    );

}


function getCurrentHourIndex(times) {

    const now = new Date();

    let best = 0;

    let difference =
        Infinity;

    times.forEach((time, index) => {

        const d =
            Math.abs(
                new Date(time) - now
            );

        if (d < difference) {

            difference = d;

            best = index;

        }

    });

    return best;

}


/* WYSZUKIWANIE */

const cityInput =
    document.getElementById("cityInput");

const searchBtn =
    document.getElementById("searchBtn");

const searchResults =
    document.getElementById("searchResults");


cityInput.addEventListener(
    "input",
    async () => {

        const query =
            cityInput.value.trim();

        if (query.length < 2) {

            searchResults.innerHTML = "";

            return;

        }

        try {

            const response =
                await fetch(
                    `${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=pl&format=json`
                );

            const data =
                await response.json();

            searchResults.innerHTML = "";

            if (!data.results)
                return;

            data.results.forEach(place => {

                const item =
                    document.createElement("div");

                item.className =
                    "search-result";

                item.innerHTML = `
                    📍 <b>${place.name}</b>
                    <span style="color:#94a3b8">
                        ${place.admin1 || ""}
                        ${place.country || ""}
                    </span>
                `;

                item.onclick = () => {

                    searchResults.innerHTML = "";

                    cityInput.value =
                        place.name;

                    loadWeather(
                        place.latitude,
                        place.longitude,
                        place.name,
                        place.country
                    );

                };

                searchResults.appendChild(item);

            });

        } catch(error) {

            console.error(error);

        }

    }
);


searchBtn.onclick = () => {

    const query =
        cityInput.value.trim();

    if (!query)
        return;

    searchCity(query);

};


cityInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            searchBtn.click();

        }

    }
);


async function searchCity(query) {

    document.getElementById("loading")
        .classList.remove("hidden");

    document.getElementById("weatherApp")
        .classList.add("hidden");

    try {

        const response =
            await fetch(
                `${GEO_API}?name=${encodeURIComponent(query)}&count=1&language=pl&format=json`
            );

        const data =
            await response.json();

        if (!data.results)
            throw new Error(
                "Nie znaleziono miejscowości."
            );

        const place =
            data.results[0];

        loadWeather(
            place.latitude,
            place.longitude,
            place.name,
            place.country
        );

    } catch(error) {

        alert(error.message);

        document.getElementById("loading")
            .classList.add("hidden");

    }

}


/* POGODA */

async function loadWeather(
    latitude,
    longitude,
    city,
    country
) {

    document.getElementById("loading")
        .classList.remove("hidden");

    document.getElementById("weatherApp")
        .classList.add("hidden");

    currentPlace = {
        latitude,
        longitude,
        city,
        country
    };


    const params = new URLSearchParams({

        latitude,
        longitude,

        current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_gusts_10m,visibility,uv_index",

        hourly:
            "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_gusts_10m,visibility,uv_index",

        daily:
            "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max",

        timezone: "auto",

        forecast_days: "10"

    });


    try {

        const response =
            await fetch(
                `${WEATHER_API}?${params}`
            );

        if (!response.ok)
            throw new Error(
                "Błąd serwera pogodowego."
            );

        weatherData =
            await response.json();


        renderCurrent();

        renderHourly();

        renderDaily();

        renderDetailedHourly();

        renderSun();


        document.getElementById("loading")
            .classList.add("hidden");

        document.getElementById("weatherApp")
            .classList.remove("hidden");


    } catch(error) {

        console.error(error);

        alert(
            "Nie udało się pobrać danych pogodowych."
        );

        document.getElementById("loading")
            .classList.add("hidden");

    }

}


/* AKTUALNA POGODA */

function renderCurrent() {

    const c =
        weatherData.current;

    const [description, icon] =
        info(c.weather_code);


    document.getElementById(
        "locationName"
    ).textContent =
        currentPlace.city;


    document.getElementById(
        "locationCountry"
    ).textContent =
        currentPlace.country;


    document.getElementById(
        "currentDate"
    ).textContent =
        formatDate(c.time);


    document.getElementById(
        "currentTemp"
    ).textContent =
        Math.round(c.temperature_2m);


    document.getElementById(
        "feelsTemp"
    ).textContent =
        Math.round(c.apparent_temperature)
        + "°C";


    document.getElementById(
        "currentDescription"
    ).textContent =
        description;


    document.getElementById(
        "currentIcon"
    ).textContent =
        icon;


    document.getElementById(
        "humidity"
    ).textContent =
        c.relative_humidity_2m + "%";


    document.getElementById(
        "wind"
    ).textContent =
        Math.round(c.wind_speed_10m)
        + " km/h";


    document.getElementById(
        "gusts"
    ).textContent =
        Math.round(c.wind_gusts_10m)
        + " km/h";


    document.getElementById(
        "clouds"
    ).textContent =
        c.cloud_cover + "%";


    document.getElementById(
        "pressure"
    ).textContent =
        Math.round(c.surface_pressure)
        + " hPa";


    document.getElementById(
        "uv"
    ).textContent =
        c.uv_index.toFixed(1);


    document.getElementById(
        "visibility"
    ).textContent =
        (c.visibility / 1000).toFixed(1)
        + " km";


    document.getElementById(
        "precipitation"
    ).textContent =
        c.precipitation + " mm";


    document.getElementById(
        "lastUpdate"
    ).textContent =
        "Aktualizacja " +
        formatTime(c.time);

}


/* GODZINOWA */

function renderHourly() {

    const container =
        document.getElementById(
            "hourlyForecast"
        );

    container.innerHTML = "";


    const h =
        weatherData.hourly;


    const start =
        getCurrentHourIndex(h.time);


    for (
        let i = start;
        i < start + 24;
        i++
    ) {

        const [description, icon] =
            info(h.weather_code[i]);


        const card =
            document.createElement("div");

        card.className =
            "hour-card";


        if (i === start)
            card.classList.add("now");


        card.innerHTML = `

            <div class="hour-time">
                ${
                    i === start
                    ? "TERAZ"
                    : formatTime(h.time[i])
                }
            </div>

            <div
                class="hour-icon"
                title="${description}"
            >
                ${icon}
            </div>

            <div class="hour-temp">
                ${Math.round(h.temperature_2m[i])}°C
            </div>

            <div class="hour-rain">
                🌧️
                ${h.precipitation_probability[i] ?? 0}%
            </div>

        `;


        container.appendChild(card);

    }

}


/* 10 DNI */

function renderDaily() {

    const container =
        document.getElementById(
            "dailyForecast"
        );

    container.innerHTML = "";


    const d =
        weatherData.daily;


    for (let i = 0; i < 10; i++) {

        const [description, icon] =
            info(d.weather_code[i]);


        const card =
            document.createElement("div");

        card.className =
            "day-card";


        card.innerHTML = `

            <div>

                <div class="day-name">

                    ${
                        i === 0
                        ? "Dzisiaj"
                        : new Date(
                            d.time[i]
                        ).toLocaleDateString(
                            "pl-PL",
                            {
                                weekday: "long"
                            }
                        )
                    }

                </div>

                <div class="day-date">
                    ${shortDate(d.time[i])}
                </div>

            </div>


            <div class="day-icon">
                ${icon}
            </div>


            <div class="day-condition">
                ${description}
            </div>


            <div class="day-temp">

                ${
                    Math.round(
                        d.temperature_2m_max[i]
                    )
                }°

                /

                ${
                    Math.round(
                        d.temperature_2m_min[i]
                    )
                }°C

            </div>


            <div class="day-rain">

                🌧️
                ${
                    d.precipitation_probability_max[i] ?? 0
                }%

                <br>

                <span style="color:#64748b">
                    ${
                        d.precipitation_sum[i]
                    } mm
                </span>

            </div>

        `;


        container.appendChild(card);

    }

}


/* SZCZEGÓŁOWA GODZINOWA */

function renderDetailedHourly() {

    const container =
        document.getElementById(
            "detailHourly"
        );

    container.innerHTML = "";


    const h =
        weatherData.hourly;


    const start =
        getCurrentHourIndex(h.time);


    for (
        let i = start;
        i < start + 24;
        i++
    ) {

        const [description, icon] =
            info(h.weather_code[i]);


        const row =
            document.createElement("div");

        row.className =
            "detail-row";


        row.innerHTML = `

            <span>
                ${formatTime(h.time[i])}
            </span>

            <span>
                ${icon}
            </span>

            <strong>
                ${Math.round(
                    h.temperature_2m[i]
                )}°C
            </strong>

            <span class="detail-rain">
                🌧️
                ${
                    h.precipitation_probability[i] ?? 0
                }%
            </span>

            <span class="hide-mobile">
                💨
                ${Math.round(
                    h.wind_speed_10m[i]
                )} km/h
            </span>

            <span class="hide-mobile">
                💧
                ${h.relative_humidity_2m[i]}%
            </span>

        `;


        container.appendChild(row);

    }

}


/* SŁOŃCE */

function renderSun() {

    const d =
        weatherData.daily;


    const sunrise =
        formatTime(d.sunrise[0]);

    const sunset =
        formatTime(d.sunset[0]);


    document.getElementById(
        "sunrise"
    ).textContent =
        sunrise;


    document.getElementById(
        "sunset"
    ).textContent =
        sunset;


    document.getElementById(
        "sunrise2"
    ).textContent =
        sunrise;


    document.getElementById(
        "sunset2"
    ).textContent =
        sunset;

}


/* LOKALIZACJA */

document.getElementById(
    "locationBtn"
).onclick = () => {

    if (!navigator.geolocation) {

        alert(
            "Twoja przeglądarka nie obsługuje lokalizacji."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            loadWeather(

                position.coords.latitude,

                position.coords.longitude,

                "Moja lokalizacja",

                ""

            );

        },

        () => {

            alert(
                "Nie udało się uzyskać lokalizacji."
            );

        }

    );

};


/* ODŚWIEŻ */

document.getElementById(
    "refreshBtn"
).onclick = () => {

    if (!currentPlace)
        return;

    loadWeather(
        currentPlace.latitude,
        currentPlace.longitude,
        currentPlace.city,
        currentPlace.country
    );

};


/* START */

loadWeather(
    52.2297,
    21.0122,
    "Warszawa",
    "Polska"
);


/* AUTOMATYCZNE ODŚWIEŻANIE */

setInterval(() => {

    if (!currentPlace)
        return;

    loadWeather(
        currentPlace.latitude,
        currentPlace.longitude,
        currentPlace.city,
        currentPlace.country
    );

}, 15 * 60 * 1000);
