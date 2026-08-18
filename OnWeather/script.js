const API =
    "https://api.open-meteo.com/v1/forecast";

const GEO =
    "https://geocoding-api.open-meteo.com/v1/search";


let weather = null;
let locationData = null;

let temperatureChart = null;
let rainChart = null;

let settings = {

    temperature: "c",
    wind: "kmh",
    theme: "dark"

};


/* =========================
   WEATHER CODES
========================= */

const WEATHER = {

    0: ["Bezchmurnie", "☀️", "none"],

    1: ["Przeważnie bezchmurnie", "🌤️", "none"],

    2: ["Częściowe zachmurzenie", "⛅", "none"],

    3: ["Pochmurno", "☁️", "none"],

    45: ["Mgła", "🌫️", "none"],
    48: ["Mgła", "🌫️", "none"],

    51: ["Lekka mżawka", "🌦️", "rain"],
    53: ["Mżawka", "🌦️", "rain"],
    55: ["Silna mżawka", "🌧️", "rain"],

    56: ["Marznąca mżawka", "🌧️", "rain"],
    57: ["Silna marznąca mżawka", "🌧️", "rain"],

    61: ["Lekki deszcz", "🌦️", "rain"],
    63: ["Deszcz", "🌧️", "rain"],
    65: ["Silny deszcz", "🌧️", "rain"],

    66: ["Marznący deszcz", "🌧️", "rain"],
    67: ["Silny marznący deszcz", "🌧️", "rain"],

    71: ["Lekki śnieg", "🌨️", "snow"],
    73: ["Śnieg", "❄️", "snow"],
    75: ["Silny śnieg", "❄️", "snow"],
    77: ["Śnieg ziarnisty", "🌨️", "snow"],

    80: ["Przelotne opady", "🌦️", "rain"],
    81: ["Przelotny deszcz", "🌧️", "rain"],
    82: ["Silne opady", "⛈️", "rain"],

    85: ["Przelotny śnieg", "🌨️", "snow"],
    86: ["Silny śnieg", "❄️", "snow"],

    95: ["Burza", "⛈️", "storm"],
    96: ["Burza z gradem", "⛈️", "storm"],
    99: ["Silna burza z gradem", "⛈️", "storm"]

};


/* =========================
   ELEMENTY
========================= */

const $ = id =>
    document.getElementById(id);


/* =========================
   FORMAT
========================= */

function getWeather(code) {

    return WEATHER[code] ||
        ["Nieznana pogoda", "🌡️", "none"];

}


function formatTime(value) {

    return new Date(value)
        .toLocaleTimeString(
            "pl-PL",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


function formatDate(value) {

    return new Date(value)
        .toLocaleDateString(
            "pl-PL",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

}


function shortDate(value) {

    return new Date(value)
        .toLocaleDateString(
            "pl-PL",
            {
                day: "numeric",
                month: "short"
            }
        );

}


function windDirection(degrees) {

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    return directions[
        Math.round(degrees / 45) % 8
    ];

}


/* =========================
   UNITS
========================= */

function temp(value) {

    if (settings.temperature === "f") {

        return Math.round(
            value * 9 / 5 + 32
        );

    }

    return Math.round(value);

}


function tempDecimal(value) {

    if (settings.temperature === "f") {

        return (
            value * 9 / 5 + 32
        ).toFixed(1);

    }

    return value.toFixed(1);

}


function wind(value) {

    if (settings.wind === "mph") {

        return (
            value * 0.621371
        ).toFixed(0);

    }

    return Math.round(value);

}


function temperatureUnit() {

    return settings.temperature === "f"
        ? "°F"
        : "°C";

}


function windUnit() {

    return settings.wind === "mph"
        ? "mph"
        : "km/h";

}


/* =========================
   OPADY - POPRAWIONA LOGIKA
========================= */

function hasPrecipitation(
    code,
    precipitation,
    probability
) {

    const type =
        getWeather(code)[2];


    return (

        type === "rain" ||
        type === "snow" ||
        type === "storm" ||

        precipitation > 0.05 ||

        probability >= 20

    );

}


function rainHTML(
    code,
    precipitation,
    probability
) {

    if (
        !hasPrecipitation(
            code,
            precipitation,
            probability
        )
    ) {

        return "";

    }


    const type =
        getWeather(code)[2];


    let icon = "🌧️";


    if (type === "snow")
        icon = "❄️";

    if (type === "storm")
        icon = "⛈️";


    return `
        <div class="hour-rain">
            ${icon} ${Math.round(probability)}%
            ${
                precipitation > 0
                ? `<br>${precipitation.toFixed(1)} mm`
                : ""
            }
        </div>
    `;

}


/* =========================
   LOAD WEATHER
========================= */

async function loadWeather(
    latitude,
    longitude,
    name,
    country,
    region = ""
) {

    showLoading(true);
    hideError();


    const params =
        new URLSearchParams({

            latitude,
            longitude,

            timezone: "auto",

            forecast_days: "14",

            current: [

                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "dew_point_2m",
                "precipitation",
                "weather_code",
                "cloud_cover",
                "surface_pressure",
                "visibility",
                "wind_speed_10m",
                "wind_direction_10m",
                "wind_gusts_10m",
                "uv_index",
                "is_day"

            ].join(","),


            hourly: [

                "temperature_2m",
                "relative_humidity_2m",
                "dew_point_2m",
                "apparent_temperature",

                "precipitation_probability",
                "precipitation",

                "rain",
                "showers",
                "snowfall",

                "weather_code",

                "cloud_cover",
                "visibility",

                "surface_pressure",

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

                "precipitation_sum",
                "precipitation_hours",

                "precipitation_probability_max",

                "rain_sum",
                "showers_sum",
                "snowfall_sum",

                "wind_speed_10m_max",
                "wind_gusts_10m_max",

                "wind_direction_10m_dominant",

                "uv_index_max",

                "sunrise",
                "sunset",

                "daylight_duration",
                "sunshine_duration"

            ].join(",")

        });


    try {

        const response =
            await fetch(
                `${API}?${params}`
            );


        if (!response.ok)
            throw new Error(
                "API error"
            );


        weather =
            await response.json();


        locationData = {

            latitude:
                Number(latitude),

            longitude:
                Number(longitude),

            name,

            country,

            region

        };


        saveLocation();

        render();


    } catch (error) {

        console.error(error);

        showError(
            "Nie udało się pobrać danych pogodowych. Sprawdź połączenie z internetem."
        );

    }


    showLoading(false);

}


/* =========================
   RENDER
========================= */

function render() {

    renderCurrent();

    renderHourly();

    renderDaily();

    renderDetails();

    renderSun();

    renderLocation();

    renderCharts();

    checkAlerts();

}


/* =========================
   CURRENT
========================= */

function renderCurrent() {

    const c =
        weather.current;


    const [
        description,
        icon,
        type
    ] =
        getWeather(
            c.weather_code
        );


    $("cityName").textContent =
        locationData.name;


    $("countryName").textContent =
        locationData.country || "";


    $("currentDate").textContent =
        formatDate(c.time);


    $("currentTemp").textContent =
        temp(c.temperature_2m);


    document.querySelector(
        ".current-temperature sup"
    ).textContent =
        temperatureUnit();


    $("weatherDescription").textContent =
        description;


    $("feelsLike").textContent =
        `${temp(c.apparent_temperature)}${temperatureUnit()}`;


    $("weatherIcon").textContent =
        icon;


    $("humidity").textContent =
        `${c.relative_humidity_2m}%`;


    $("wind").textContent =
        `${wind(c.wind_speed_10m)} ${windUnit()}`;


    $("gust").textContent =
        `${wind(c.wind_gusts_10m)} ${windUnit()}`;


    $("windDirection").textContent =
        `${windDirection(
            c.wind_direction_10m
        )} ${Math.round(
            c.wind_direction_10m
        )}°`;


    $("dewPoint").textContent =
        `${tempDecimal(
            c.dew_point_2m
        )}${temperatureUnit()}`;


    $("clouds").textContent =
        `${c.cloud_cover}%`;


    $("pressure").textContent =
        `${Math.round(
            c.surface_pressure
        )} hPa`;


    $("visibility").textContent =
        `${(
            c.visibility / 1000
        ).toFixed(1)} km`;


    $("uv").textContent =
        Number(c.uv_index)
        .toFixed(1);


    $("precipitation").textContent =
        c.precipitation > 0
        ? `${c.precipitation.toFixed(1)} mm`
        : "Brak opadu";


    $("lastUpdate").textContent =
        `Aktualizacja ${formatTime(c.time)}`;


    renderBadges();

}


/* =========================
   BADGES
========================= */

function renderBadges() {

    const c =
        weather.current;


    const box =
        $("weatherBadges");


    box.innerHTML = "";


    if (c.is_day === 0) {

        addBadge(
            "🌙 Noc"
        );

    } else {

        addBadge(
            "☀️ Dzień"
        );

    }


    if (c.uv_index >= 6) {

        addBadge(
            "⚠️ Wysokie UV"
        );

    }


    if (c.wind_gusts_10m >= 50) {

        addBadge(
            "💨 Silne porywy"
        );

    }


    if (
        hasPrecipitation(
            c.weather_code,
            c.precipitation,
            100
        )
    ) {

        addBadge(
            "🌧️ Opady"
        );

    }


    if (
        c.weather_code >= 95
    ) {

        addBadge(
            "⛈️ Burza"
        );

    }

}


function addBadge(text) {

    const div =
        document.createElement(
            "span"
        );

    div.className =
        "badge";

    div.textContent =
        text;

    $("weatherBadges")
        .appendChild(div);

}


/* =========================
   HOURLY
========================= */

function currentIndex() {

    const now =
        Date.now();


    let best = 0;

    let distance =
        Infinity;


    weather.hourly.time
        .forEach(
            (timeValue, index) => {

                const d =
                    Math.abs(
                        new Date(
                            timeValue
                        ).getTime()
                        - now
                    );


                if (d < distance) {

                    distance = d;

                    best = index;

                }

            }
        );


    return best;

}


function renderHourly() {

    const box =
        $("hourlyForecast");


    box.innerHTML = "";


    const h =
        weather.hourly;


    const start =
        currentIndex();


    for (
        let i = start;
        i < start + 24;
        i++
    ) {

        if (!h.time[i])
            break;


        const [
            description,
            icon
        ] =
            getWeather(
                h.weather_code[i]
            );


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "hour-card";


        if (i === start)
            card.classList.add("now");


        const rain =
            rainHTML(
                h.weather_code[i],
                h.precipitation[i] || 0,
                h.precipitation_probability[i] || 0
            );


        card.innerHTML = `

            <div class="hour-time">

                ${
                    i === start
                    ? "TERAZ"
                    : formatTime(
                        h.time[i]
                    )
                }

            </div>

            <div
                class="hour-icon"
                title="${description}"
            >
                ${icon}
            </div>

            <div class="hour-temp">

                ${temp(
                    h.temperature_2m[i]
                )}${temperatureUnit()}

            </div>

            <div class="hour-feels">

                Odcz.
                ${temp(
                    h.apparent_temperature[i]
                )}${temperatureUnit()}

            </div>

            ${rain}

            <div class="hour-wind">

                💨
                ${wind(
                    h.wind_speed_10m[i]
                )}
                ${windUnit()}

            </div>

        `;


        box.appendChild(card);

    }

}


/* =========================
   DAILY
========================= */

function renderDaily() {

    const box =
        $("dailyForecast");


    box.innerHTML = "";


    const d =
        weather.daily;


    for (
        let i = 0;
        i < 14;
        i++
    ) {

        if (!d.time[i])
            break;


        const [
            description,
            icon
        ] =
            getWeather(
                d.weather_code[i]
            );


        const probability =
            d.precipitation_probability_max[i] || 0;


        const precipitation =
            d.precipitation_sum[i] || 0;


        const showRain =
            hasPrecipitation(
                d.weather_code[i],
                precipitation,
                probability
            );


        const card =
            document.createElement(
                "article"
            );


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

                    ${shortDate(
                        d.time[i]
                    )}

                </div>

            </div>


            <div class="day-icon">

                ${icon}

            </div>


            <div class="day-description">

                ${description}

            </div>


            <div class="day-temp">

                ${temp(
                    d.temperature_2m_max[i]
                )}${temperatureUnit()}

                /

                ${temp(
                    d.temperature_2m_min[i]
                )}${temperatureUnit()}

            </div>


            <div
                class="
                    day-rain
                    ${
                        showRain
                        ? ""
                        : "hidden-rain"
                    }
                "
            >

                🌧️ ${Math.round(
                    probability
                )}%

                <br>

                <small>

                    ${precipitation.toFixed(1)}
                    mm

                </small>

            </div>

        `;


        box.appendChild(card);

    }

}


/* =========================
   DETAILS
========================= */

function renderDetails() {

    const box =
        $("detailedHourly");


    box.innerHTML = "";


    const h =
        weather.hourly;


    const start =
        currentIndex();


    for (
        let i = start;
        i < start + 24;
        i++
    ) {

        if (!h.time[i])
            break;


        const [
            description,
            icon
        ] =
            getWeather(
                h.weather_code[i]
            );


        const probability =
            h.precipitation_probability[i] || 0;


        const precipitation =
            h.precipitation[i] || 0;


        const showRain =
            hasPrecipitation(
                h.weather_code[i],
                precipitation,
                probability
            );


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "detail-row";


        row.innerHTML = `

            <span>

                ${formatTime(
                    h.time[i]
                )}

            </span>


            <span>

                ${icon}

            </span>


            <strong>

                ${temp(
                    h.temperature_2m[i]
                )}${temperatureUnit()}

            </strong>


            <span>

                ${description}

            </span>


            <span class="
                optional
                detail-rain
            ">

                ${
                    showRain
                    ? `🌧️ ${Math.round(
                        probability
                    )}%`
                    : ""
                }

            </span>


            <span class="optional">

                💨 ${wind(
                    h.wind_speed_10m[i]
                )} ${windUnit()}

            </span>


            <span class="optional">

                💧 ${
                    h.relative_humidity_2m[i]
                }%

            </span>

        `;


        box.appendChild(row);

    }

}


/* =========================
   SUN
========================= */

function renderSun() {

    const d =
        weather.daily;


    const sunrise =
        formatTime(
            d.sunrise[0]
        );


    const sunset =
        formatTime(
            d.sunset[0]
        );


    $("sunrise").textContent =
        sunrise;


    $("sunset").textContent =
        sunset;


    $("sunrise2").textContent =
        sunrise;


    $("sunset2").textContent =
        sunset;


    updateSunPosition(
        d.sunrise[0],
        d.sunset[0]
    );

}


function updateSunPosition(
    sunrise,
    sunset
) {

    const now =
        Date.now();


    const start =
        new Date(sunrise)
            .getTime();


    const end =
        new Date(sunset)
            .getTime();


    let percent =
        ((now - start) /
            (end - start))
        * 100;


    percent =
        Math.max(
            0,
            Math.min(
                100,
                percent
            )
        );


    document.querySelector(
        ".sun-ball"
    ).style.left =
        `${percent}%`;

}


/* =========================
   LOCATION
========================= */

function renderLocation() {

    $("infoCity").textContent =
        locationData.name;


    $("infoCountry").textContent =
        locationData.country ||
        "-";


    $("infoRegion").textContent =
        locationData.region ||
        "-";


    $("coordinates").textContent =
        `${locationData.latitude.toFixed(4)},
         ${locationData.longitude.toFixed(4)}`;


    $("timezone").textContent =
        weather.timezone;


    $("elevation").textContent =
        weather.ele
