const API =
    "https://api.open-meteo.com/v1/forecast";

const GEO =
    "https://geocoding-api.open-meteo.com/v1/search";


let weather = null;

let locationData = null;

let selectedDay = 0;


const $ = id =>
    document.getElementById(id);


const ui = {

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

    selectedDayLabel:
        $("selectedDayLabel"),

    dayDetails:
        $("dayDetails")
};


/* =========================
   KODY POGODOWE
========================= */

const weatherCodes = {

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


function icon(code) {

    return weatherCodes[code]?.[0]
        || "🌤️";
}


function description(code) {

    return weatherCodes[code]?.[1]
        || "Warunki pogodowe";
}


/* =========================
   FUNKCJE
========================= */

function num(value, decimals = 0) {

    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "--";
    }

    return Number(value).toFixed(
        decimals
    );
}


function time(value) {

    if (!value) {
        return "--:--";
    }

    return new Date(value)
        .toLocaleTimeString(
            "pl-PL",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


function date(value, options) {

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

    return dirs[
        Math.round(
            Number(degrees) / 45
        ) % 8
    ];
}


function status(text, error = false) {

    ui.status.textContent = text;

    ui.status.className =
        error
            ? "status error"
            : "status";
}


/* =========================
   API
========================= */

async function getWeather(
    lat,
    lon,
    name,
    country = ""
) {

    status(
        "🌦️ Pobieram dane pogodowe..."
    );


    const params = new URLSearchParams({

        latitude: lat,

        longitude: lon,

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
                API +
                "?" +
                params.toString()
            );


        if (!response.ok) {

            throw new Error(
                "API HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            !data.current ||
            !data.hourly ||
            !data.daily
        ) {

            throw new Error(
                "API nie zwróciło kompletnych danych."
            );
        }


        weather = data;


        locationData = {

            lat,

            lon,

            name,

            country
        };


        localStorage.setItem(
            "onweather-location",
            JSON.stringify(
                locationData
            )
        );


        selectedDay = 0;


        render();


        status(
            "✅ Dane pogodowe zaktualizowane • " +
            time(data.current.time)
        );


    } catch (error) {

        console.error(
            "OnWeather:",
            error
        );


        status(
            "❌ Błąd pobierania pogody. Sprawdź internet.",
            true
        );
    }
}


/* =========================
   AKTUALNA GODZINA
========================= */

function hourIndex() {

    if (!weather) {
        return 0;
    }


    const current =
        new Date(
            weather.current.time
        ).getTime();


    let index =
        weather.hourly.time.findIndex(
            t =>
                new Date(t).getTime()
                >= current
        );


    if (index < 0) {
        index = 0;
    }


    return index;
}


/* =========================
   RENDER GŁÓWNY
========================= */

function render() {

    const c =
        weather.current;

    const d =
        weather.daily;


    ui.locationName.textContent =
        locationData.name +
        (
            locationData.country
                ? " • " +
                  locationData.country
                : ""
        );


    ui.updatedAt.textContent =
        "Aktualizacja: " +
        time(c.time) +
        " • " +
        weather.timezone;


    ui.currentTemp.textContent =
        num(
            c.temperature_2m
        );


    ui.currentIcon.textContent =
        icon(
            c.weather_code
        );


    ui.currentCondition.textContent =
        description(
            c.weather_code
        );


    ui.feelsLike.textContent =
        num(
            c.apparent_temperature
        );


    ui.sunrise.textContent =
        time(
            d.sunrise[0]
        );


    ui.sunset.textContent =
        time(
            d.sunset[0]
        );


    const isRain =
        Number(c.precipitation || 0) > 0 ||
        [
            51,53,55,
            56,57,
            61,63,65,
            66,67,
            80,81,82,
            95,96,99
        ].includes(
            Number(c.weather_code)
        );


    if (isRain) {

        ui.rainNow.classList.remove(
            "hidden"
        );


        ui.rainNow.textContent =
            "🌧️ Opady teraz: " +
            num(
                c.precipitation,
                1
            ) +
            " mm";

    } else {

        ui.rainNow.classList.add(
            "hidden"
        );
    }


    renderStats();

    renderHourly();

    renderDaily();

    renderDetails(
        selectedDay
    );
}


/* =========================
   STATYSTYKI
========================= */

function renderStats() {

    const c =
        weather.current;

    const h =
        weather.hourly;

    const d =
        weather.daily;


    const index =
        hourIndex();


    const visibility =
        h.visibility?.[index];


    const stats = [

        [
            "💧",
            "Wilgotność",
            num(
                c.relative_humidity_2m
            ) + "%",
            "Aktualnie"
        ],

        [
            "💨",
            "Wiatr",
            num(
                c.wind_speed_10m
            ) + " km/h",
            "Prędkość"
        ],

        [
            "🌬️",
            "Porywy",
            num(
                c.wind_gusts_10m
            ) + " km/h",
            "Maksymalny poryw"
        ],

        [
            "🧭",
            "Kierunek wiatru",
            windDirection(
                c.wind_direction_10m
            ),
            num(
                c.wind_direction_10m
            ) + "°"
        ],

        [
            "🌡️",
            "Punkt rosy",
            num(
                c.dew_point_2m
            ) + "°C",
            ""
        ],

        [
            "☁️",
            "Zachmurzenie",
            num(
                c.cloud_cover
            ) + "%",
            ""
        ],

        [
            "📊",
            "Ciśnienie",
            num(
                c.pressure_msl
            ) + " hPa",
            ""
        ],

        [
            "👁️",
            "Widoczność",
            visibility == null
                ? "--"
                : num(
                    visibility / 1000,
                    1
                ) + " km",
            "Aktualnie"
        ],

        [
            "🌧️",
            "Opad",
            num(
                c.precipitation,
                1
            ) + " mm",
            "Teraz"
        ],

        [
            "☀️",
            "UV",
            num(
                d.uv_index_max[0],
                1
            ),
            "Maks. dzisiaj"
        ],

        [
            "❄️",
            "Śnieg",
            num(
                c.snowfall,
                1
            ) + " cm",
            "Teraz"
        ],

        [
            "🌡️",
            "Odczuwalna",
            num(
                c.apparent_temperature
            ) + "°C",
            ""
        ]
    ];


    ui.statsGrid.innerHTML =
        stats.map(
            s => `

                <div class="stat">

                    <div class="stat-icon">
                        ${s[0]}
                    </div>

                    <div class="stat-label">
                        ${s[1]}
                    </div>

                    <div class="stat-value">
                        ${s[2]}
                    </div>

                    <div class="stat-sub">
                        ${s[3]}
                    </div>

                </div>

            `
        ).join("");
}


/* =========================
   GODZINOWA
========================= */

function renderHourly() {

    const h =
        weather.hourly;


    const start =
        hourIndex();


    let html = "";


    for (
        let i = start;
        i < start + 48 &&
        i < h.time.length;
        i++
    ) {

        const rain =
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
                            : time(h.time[i])
                    }
                </div>

                <div class="hour-icon">
                    ${icon(
                        h.weather_code[i]
                    )}
                </div>

                <div class="hour-temp">
                    ${num(
                        h.temperature_2m[i]
                    )}°
                </div>

                <div class="hour-rain">
                    ${
                        rain > 0
                            ? "💧 " + rain + "%"
                            : ""
                    }
                </div>

                <div class="hour-wind">
                    💨
                    ${num(
                        h.wind_speed_10m[i]
                    )}
                    km/h
                </div>

            </div>

        `;
    }


    ui.hourly.innerHTML =
        html;
}


/* =========================
   14 DNI
========================= */

function renderDaily() {

    const d =
        weather.daily;


    ui.daily.innerHTML =
        d.time.map(
            (day, i) => {

                const rain =
                    Number(
                        d.precipitation_probability_max[i]
                        ?? 0
                    );


                const precipitation =
                    Number(
                        d.precipitation_sum[i]
                        ?? 0
                    );


                const hasRain =
                    rain > 0 ||
                    precipitation > 0;


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
                                    : date(
                                        day,
                                        {
                                            weekday:
                                                "short"
                                        }
                                    )
                            }

                            <small>
                                ${date(
                                    day,
                                    {
                                        day:
                                            "numeric",
                                        month:
                                            "short"
                                    }
                                )}
                            </small>

                        </div>


                        <div class="day-icon">

                            ${icon(
                                d.weather_code[i]
                            )}

                        </div>


                        <div class="day-temp">

                            ${num(
                                d.temperature_2m_min[i]
                            )}°

                            /

                            <b>
                                ${num(
                                    d.temperature_2m_max[i]
                                )}°
                            </b>

                        </div>


                        <div class="day-rain">

                            ${
                                hasRain
                                    ? "💧 " +
                                      rain +
                                      "%"
                                    : "☀️ Brak opadów"
                            }

                        </div>


                        <div class="day-wind">

                            💨
                            ${num(
                                d.wind_speed_10m_max[i]
                            )}
                            km/h

                            <br>

                            🧭
                            ${windDirection(
                                d.wind_direction_10m_dominant[i]
                            )}

                        </div>

                    </div>

                `;
            }
        ).join("");


    document
        .querySelectorAll(".day")
        .forEach(day => {

            day.addEventListener(
                "click",
                () => {

                    selectedDay =
                        Number(
                            day.dataset.day
                        );


                    renderDaily();

                    renderDetails(
                        selectedDay
                    );
                }
            );

        });
}


/* =========================
   SZCZEGÓŁY DNIA
========================= */

function renderDetails(index) {

    const d =
        weather.daily;


    ui.selectedDayLabel.textContent =
        date(
            d.time[index],
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );


    const items = [

        [
            "🌡️",
            "Temperatura",
            `${num(
                d.temperature_2m_min[index]
            )}°C — ${num(
                d.temperature_2m_max[index]
            )}°C`
        ],

        [
            "🌡️",
            "Odczuwalna",
            `${num(
                d.apparent_temperature_min[index]
            )}°C — ${num(
                d.apparent_temperature_max[index]
            )}°C`
        ],

        [
            "🌧️",
            "Szansa opadów",
            num(
                d.precipitation_probability_max[index]
            ) + "%"
        ],

        [
            "💧",
            "Suma opadów",
            num(
                d.precipitation_sum[index],
                1
            ) + " mm"
        ],

        [
            "☀️",
            "UV",
            num(
                d.uv_index_max[index],
                1
            )
        ],

        [
            "🌅",
            "Wschód",
            time(
                d.sunrise[index]
            )
        ],

        [
            "🌇",
            "Zachód",
            time(
                d.sunset[index]
            )
        ],

        [
            "💨",
            "Maks. wiatr",
            num(
                d.wind_speed_10m_max[index]
            ) + " km/h"
        ],

        [
            "🌬️",
            "Maks. porywy",
            num(
                d.wind_gusts_10m_max[index]
            ) + " km/h"
        ],

        [
            "🧭",
            "Dominujący kierunek",
            windDirection(
                d.wind_direction_10m_dominant[index]
            )
        ],

        [
            "☀️",
            "Nasłonecznienie",
            num(
                d.sunshine_duration[index] / 3600,
                1
            ) + " h"
        ],

        [
            "🌤️",
            "Długość dnia",
            num(
                d.daylight_duration[index] / 3600,
                1
            ) + " h"
        ]
    ];


    ui.dayDetails.innerHTML = `

        <div class="detail-grid">

            ${
                items.map(
         
