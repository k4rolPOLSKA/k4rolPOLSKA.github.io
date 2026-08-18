const API = "https://api.open-meteo.com/v1/forecast";
const GEO = "https://geocoding-api.open-meteo.com/v1/search";

let weather = null;
let selectedLocation = null;
let selectedDay = 0;

const $ = id => document.getElementById(id);

const el = {
    status: $("status"),
    cityInput: $("cityInput"),
    searchBtn: $("searchBtn"),
    searchResults: $("searchResults"),
    locationBtn: $("locationBtn"),
    refreshBtn: $("refreshBtn"),

    locationName: $("locationName"),
    updatedAt: $("updatedAt"),

    currentIcon: $("currentIcon"),
    currentTemp: $("currentTemp"),
    currentCondition: $("currentCondition"),
    feelsLike: $("feelsLike"),

    sunrise: $("sunrise"),
    sunset: $("sunset"),

    rainNow: $("rainNow"),

    statsGrid: $("statsGrid"),
    hourly: $("hourly"),
    daily: $("daily"),
    dayDetails: $("dayDetails"),
    selectedDayLabel: $("selectedDayLabel")
};


// ==============================
// POGODA
// ==============================

const WEATHER = {

    0: ["☀️", "Bezchmurnie"],
    1: ["🌤️", "Przeważnie bezchmurnie"],
    2: ["⛅", "Częściowe zachmurzenie"],
    3: ["☁️", "Pochmurnie"],

    45: ["🌫️", "Mgła"],
    48: ["🌫️", "Mgła"],

    51: ["🌦️", "Lekka mżawka"],
    53: ["🌦️", "Mżawka"],
    55: ["🌧️", "Silna mżawka"],

    56: ["🌧️", "Marznąca mżawka"],
    57: ["🌧️", "Silna marznąca mżawka"],

    61: ["🌧️", "Lekki deszcz"],
    63: ["🌧️", "Deszcz"],
    65: ["🌧️", "Silny deszcz"],

    66: ["🌧️", "Marznący deszcz"],
    67: ["🌧️", "Silny marznący deszcz"],

    71: ["🌨️", "Lekki śnieg"],
    73: ["🌨️", "Śnieg"],
    75: ["❄️", "Silny śnieg"],
    77: ["🌨️", "Ziarna śnieżne"],

    80: ["🌦️", "Przelotne opady"],
    81: ["🌧️", "Przelotne opady"],
    82: ["⛈️", "Silne przelotne opady"],

    85: ["🌨️", "Przelotny śnieg"],
    86: ["❄️", "Silny śnieg"],

    95: ["⛈️", "Burza"],
    96: ["⛈️", "Burza z gradem"],
    99: ["⛈️", "Silna burza z gradem"]
};


function weatherIcon(code) {
    return WEATHER[code]?.[0] || "🌤️";
}


function weatherDescription(code) {
    return WEATHER[code]?.[1] || "Warunki pogodowe";
}


function number(value, decimals = 0) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "--";
    }

    return Number(value).toFixed(decimals);
}


function formatTime(value) {

    if (!value) return "--:--";

    return new Date(value).toLocaleTimeString(
        "pl-PL",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatDate(value, options) {

    return new Date(
        value + "T12:00:00"
    ).toLocaleDateString(
        "pl-PL",
        options
    );
}


function windDirection(degrees) {

    if (
        degrees === null ||
        degrees === undefined
    ) {
        return "--";
    }

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
        Math.round((Number(degrees) % 360) / 45) % 8
    ];
}


// ==============================
// STATUS
// ==============================

function setStatus(text, error = false) {

    if (!el.status) return;

    el.status.textContent = text;

    el.status.className =
        error
            ? "status error"
            : "status";
}


// ==============================
// SZUKANIE MIASTA
// ==============================

async function searchCity() {

    const city = el.cityInput.value.trim();

    if (!city) return;

    setStatus("🔎 Szukam miasta...");

    try {

        const response = await fetch(
            GEO +
            "?name=" +
            encodeURIComponent(city) +
            "&count=8" +
            "&language=pl" +
            "&format=json"
        );

        if (!response.ok) {
            throw new Error("Geocoding error");
        }

        const data = await response.json();

        el.searchResults.innerHTML = "";

        if (!data.results || data.results.length === 0) {

            setStatus(
                "❌ Nie znaleziono miasta.",
                true
            );

            return;
        }

        data.results.forEach(place => {

            const item =
                document.createElement("div");

            item.className = "result";

            item.innerHTML = `
                <b>${place.name}</b>
                <br>
                <small>
                    ${place.admin1 || ""}
                    ${place.country ? ", " + place.country : ""}
                </small>
            `;

            item.onclick = () => {

                el.searchResults.innerHTML = "";

                el.cityInput.value =
                    place.name;

                loadWeather(
                    place.latitude,
                    place.longitude,
                    place.name,
                    place.country_code || ""
                );
            };

            el.searchResults.appendChild(item);
        });

        setStatus(
            "Wybierz lokalizację z listy."
        );

    } catch (error) {

        console.error(error);

        setStatus(
            "❌ Nie można wyszukać miasta.",
            true
        );
    }
}


// ==============================
// POBIERANIE POGODY
// ==============================

async function loadWeather(
    latitude,
    longitude,
    cityName,
    country
) {

    setStatus(
        "🌦️ Pobieram aktualną pogodę..."
    );

    selectedLocation = {
        latitude,
        longitude,
        cityName,
        country
    };

    localStorage.setItem(
        "onweather-location",
        JSON.stringify(selectedLocation)
    );

    /*
       WAŻNE:

       visibility NIE znajduje się tutaj.

       visibility pobieramy niżej
       w hourly.
    */

    const params = new URLSearchParams({

        latitude: latitude,
        longitude: longitude,

        timezone: "auto",

        forecast_days: "14",

        current:
            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "precipitation," +
            "rain," +
            "showers," +
            "snowfall," +
            "weather_code," +
            "cloud_cover," +
            "pressure_msl," +
            "wind_speed_10m," +
            "wind_direction_10m," +
            "wind_gusts_10m," +
            "dew_point_2m",

        hourly:
            "temperature_2m," +
            "apparent_temperature," +
            "precipitation_probability," +
            "precipitation," +
            "rain," +
            "showers," +
            "snowfall," +
            "weather_code," +
            "cloud_cover," +
            "relative_humidity_2m," +
            "wind_speed_10m," +
            "wind_direction_10m," +
            "wind_gusts_10m," +
            "visibility," +
            "uv_index," +
            "pressure_msl," +
            "dew_point_2m",

        daily:
            "weather_code," +
            "temperature_2m_max," +
            "temperature_2m_min," +
            "apparent_temperature_max," +
            "apparent_temperature_min," +
            "sunrise," +
            "sunset," +
            "daylight_duration," +
            "sunshine_duration," +
            "uv_index_max," +
            "precipitation_sum," +
            "rain_sum," +
            "showers_sum," +
            "snowfall_sum," +
            "precipitation_probability_max," +
            "wind_speed_10m_max," +
            "wind_gusts_10m_max," +
            "wind_direction_10m_dominant"
    });


    try {

        const response =
            await fetch(
                API + "?" + params.toString()
            );

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Open-Meteo:",
                errorText
            );

            throw new Error(
                "API HTTP " +
                response.status
            );
        }

        const data =
            await response.json();


        /*
           SPRAWDZAMY CZY API
           NAPRAWDĘ ZWRÓCIŁO DANE
        */

        if (
            !data.current ||
            !data.hourly ||
            !data.daily
        ) {

            throw new Error(
                "Brak danych current/hourly/daily"
            );
        }


        weather = data;

        weather.cityName =
            cityName;

        weather.country =
            country;


        selectedDay = 0;


        renderWeather();


        setStatus(
            "✅ Pogoda zaktualizowana • " +
            formatTime(data.current.time)
        );


    } catch (error) {

        console.error(
            "ONWEATHER ERROR:",
            error
        );

        setStatus(
            "❌ Nie udało się pobrać danych pogodowych.",
            true
        );

        /*
           Próba prostego API awaryjnego
        */

        try {

            const fallback =
                await fetch(
                    `${API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&timezone=auto`
                );

            if (fallback.ok) {

                const basic =
                    await fallback.json();

                if (
                    basic.current &&
                    basic.current.temperature_2m !== undefined
                ) {

                    el.currentTemp.textContent =
                        number(
                            basic.current.temperature_2m
                        );

                    el.currentIcon.textContent =
                        weatherIcon(
                            basic.current.weather_code
                        );

                    el.currentCondition.textContent =
                        weatherDescription(
                            basic.current.weather_code
                        );

                    setStatus(
                        "⚠️ Działa tryb awaryjny. Odśwież stronę, aby pobrać pełne dane."
                    );
                }
            }

        } catch (fallbackError) {

            console.error(
                fallbackError
            );
        }
    }
}


// ==============================
// AKTUALNA GODZINA
// ==============================

function currentHourIndex() {

    if (
        !weather ||
        !weather.hourly
    ) {
        return 0;
    }

    const times =
        weather.hourly.time;

    const currentTime =
        new Date(
            weather.current.time
        ).getTime();

    let index =
        times.findIndex(
            time =>
                new Date(time).getTime()
                >= currentTime
        );

    if (index < 0) {
        index = 0;
    }

    return index;
}


function currentVisibility() {

    const index =
        currentHourIndex();

    return (
        weather.hourly.visibility?.[index]
        ?? null
    );
}


// ==============================
// RENDER
// ==============================

function renderWeather() {

    const current =
        weather.current;

    const daily =
        weather.daily;


    el.locationName.textContent =
        weather.cityName +
        (
            weather.country
                ? " • " + weather.country
                : ""
        );


    el.updatedAt.textContent =
        "Dane: " +
        formatTime(current.time) +
        " • " +
        weather.timezone;


    // TEMPERATURA
    el.currentTemp.textContent =
        number(
            current.temperature_2m
        );


    // IKONA
    el.currentIcon.textContent =
        weatherIcon(
            current.weather_code
        );


    // OPIS
    el.currentCondition.textContent =
        weatherDescription(
            current.weather_code
        );


    // ODCZUWALNA
    el.feelsLike.textContent =
        number(
            current.apparent_temperature
        );


    // WSCHÓD
    el.sunrise.textContent =
        formatTime(
            daily.sunrise[0]
        );


    // ZACHÓD
    el.sunset.textContent =
        formatTime(
            daily.sunset[0]
        );


    // DESZCZ
    const precipitation =
        Number(
            current.precipitation || 0
        );

    const code =
        Number(
            current.weather_code
        );

    const rainCodes = [
        51,53,55,
        56,57,
        61,63,65,
        66,67,
        80,81,82,
        95,96,99
    ];

    const raining =
        precipitation > 0 ||
        rainCodes.includes(code);


    if (raining) {

        el.rainNow.classList.remove(
            "hidden"
        );

        el.rainNow.textContent =
            "🌧️ Opady teraz: " +
            number(
                precipitation,
                1
            ) +
            " mm";

    } else {

        el.rainNow.classList.add(
            "hidden"
        );
    }


    // KARTY
    const visibility =
        currentVisibility();


    const cards = [

        [
            "💧",
            "Wilgotność",
            number(
                current.relative_humidity_2m
            ) + "%",
            "Aktualna"
        ],

        [
            "💨",
            "Wiatr",
            number(
                current.wind_speed_10m
            ) + " km/h",
            windDirection(
                current.wind_direction_10m
            )
        ],

        [
            "🌬️",
            "Porywy",
            number(
                current.wind_gusts_10m
            ) + " km/h",
            "Maksymalny poryw"
        ],

        [
            "🧭",
            "Kierunek wiatru",
            windDirection(
                current.wind_direction_10m
            ),
            number(
                current.wind_direction_10m
            ) + "°"
        ],

        [
            "🌡️",
            "Punkt rosy",
            number(
                current.dew_point_2m
            ) + "°C",
            ""
        ],

        [
            "☁️",
            "Zachmurzenie",
            number(
                current.cloud_cover
            ) + "%",
            ""
        ],

        [
            "📊",
            "Ciśnienie",
            number(
                current.pressure_msl
            ) + " hPa",
            ""
        ],

        [
            "👁️",
            "Widoczność",
            visibility === null
                ? "--"
                : number(
                    visibility / 1000,
                    1
                ) + " km",
            "Aktualna"
        ],

        [
            "🌧️",
            "Opad",
            number(
                current.precipitation,
                1
            ) + " mm",
            "Teraz"
        ],

        [
            "☀️",
            "UV",
            number(
                daily.uv_index_max[0],
                1
            ),
            "Maksymalny dzisiaj"
        ],

        [
            "❄️",
            "Śnieg",
            number(
                current.snowfall,
                1
            ) + " cm",
            "Teraz"
        ],

        [
            "🌡️",
            "Odczuwalna",
            number(
                current.apparent_temperature
            ) + "°C",
            ""
        ]
    ];


    el.statsGrid.innerHTML =
        cards
            .map(card => `

                <div class="stat">

                    <div class="stat-icon">
                        ${card[0]}
                    </div>

                    <div class="stat-label">
                        ${card[1]}
                    </div>

                    <div class="stat-value">
                        ${card[2]}
                    </div>

                    <div class="stat-sub">
                        ${card[3]}
                    </div>

                </div>

            `)
            .join("");


    renderHourly();
    renderDaily();
    renderDayDetails(0);
}


// ==============================
// GODZINY
// ==============================

function renderHourly() {

    const h =
        weather.hourly;

    const start =
        currentHourIndex();

    const end =
        Math.min(
            start + 48,
            h.time.length
        );


    let html = "";


    for (
        let i = start;
        i < end;
        i++
    ) {

        const probability =
            Number(
                h.precipitation_probability?.[i]
                ?? 0
            );


        html += `

            <div class="hour">

                <div class="hour-time">
                    ${
                        i === start
                            ? "Teraz"
                            : formatTime(h.time[i])
                    }
                </div>

                <div class="hour-icon">
                    ${weatherIcon(
                        h.weather_code[i]
                    )}
                </div>

                <div class="hour-temp">
                    ${number(
                        h.temperature_2m[i]
                    )}°
                </div>

                ${
                    probability > 0
                    ?
                    `<div class="hour-rain">
                        💧 ${probability}%
                    </div>`
                    :
                    `<div class="hour-rain">
                    </div>`
                }

                <div class="hour-wind">
                    💨 ${number(
                        h.wind_speed_10m[i]
                    )} km/h
                </div>

            </div>

        `;
    }


    el.hourly.innerHTML =
        html;
}


// ==============================
// 14 DNI
// ==============================

function renderDaily() {

    const d =
        weather.daily;


    el.daily.innerHTML =
        d.time
            .map((day, i) => {

                const probability =
                    Number(
                        d.precipitation_probability_max[i]
                        ?? 0
                    );


                const hasRain =
                    probability > 0 ||
                    Number(
                        d.precipitation_sum[i]
                        ?? 0
                    ) > 0;


                return `

                    <div
                        class="day ${
                            i === selectedDay
                                ? "selected"
                                : ""
                        }"
                        data-day="${i}"
                    >

                        <div class="day-date">

                            ${
                                i === 0
                                    ? "Dzisiaj"
                                    : formatDate(
                                        day,
                                        {
                                            weekday:"short"
                                        }
                                    )
                            }

                            <small>
                                ${formatDate(
                                    day,
                                    {
                                        day:"numeric",
                                        month:"short"
                                    }
                                )}
                            </small>

                        </div>


                        <div class="day-icon">

                            ${weatherIcon(
                                d.weather_code[i]
                            )}

                        </div>


                        <div class="day-temp">

                            ${number(
                                d.temperature_2m_min[i]
                            )}°

                            /

                            <b>
                                ${number(
                                    d.temperature_2m_max[i]
      
