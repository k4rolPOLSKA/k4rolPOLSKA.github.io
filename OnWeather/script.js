const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const GEO_API =
    "https://geocoding-api.open-meteo.com/v1/search";


const codes = {
    0: ["Bezchmurnie", "☀️"],
    1: ["Przeważnie bezchmurnie", "🌤️"],
    2: ["Częściowe zachmurzenie", "⛅"],
    3: ["Pochmurno", "☁️"],
    45: ["Mgła", "🌫️"],
    48: ["Mgła", "🌫️"],
    51: ["Lekka mżawka", "🌦️"],
    53: ["Mżawka", "🌦️"],
    55: ["Silna mżawka", "🌧️"],
    56: ["Marznąca mżawka", "🌧️"],
    57: ["Silna marznąca mżawka", "🌧️"],
    61: ["Lekki deszcz", "🌦️"],
    63: ["Deszcz", "🌧️"],
    65: ["Silny deszcz", "🌧️"],
    66: ["Marznący deszcz", "🌧️"],
    67: ["Silny marznący deszcz", "🌧️"],
    71: ["Lekki śnieg", "🌨️"],
    73: ["Śnieg", "❄️"],
    75: ["Silny śnieg", "❄️"],
    77: ["Śnieg ziarnisty", "🌨️"],
    80: ["Przelotne opady", "🌦️"],
    81: ["Przelotny deszcz", "🌧️"],
    82: ["Silne opady", "⛈️"],
    85: ["Przelotny śnieg", "🌨️"],
    86: ["Silny śnieg", "❄️"],
    95: ["Burza", "⛈️"],
    96: ["Burza z gradem", "⛈️"],
    99: ["Silna burza z gradem", "⛈️"]
};


let place = null;
let weather = null;


function weatherInfo(code) {
    return codes[code] || ["Nieznana pogoda", "🌡️"];
}


function time(value) {

    return new Date(value).toLocaleTimeString(
        "pl-PL",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function date(value) {

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


function windDirection(deg) {

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
        Math.round(deg / 45) % 8
    ];

}


function currentIndex() {

    const now = Date.now();

    let index = 0;
    let best = Infinity;

    weather.hourly.time.forEach(
        (t, i) => {

            const diff =
                Math.abs(
                    new Date(t).getTime() - now
                );

            if (diff < best) {

                best = diff;
                index = i;

            }

        }
    );

    return index;

}


/* API */

async function loadWeather(
    lat,
    lon,
    name,
    country,
    metadata = {}
) {

    const params = new URLSearchParams({

        latitude: lat,
        longitude: lon,

        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "dew_point_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "cloud_cover",
            "surface_pressure",
            "visibility",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "uv_index"
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
            "snow_depth",
            "weather_code",
            "cloud_cover",
            "visibility",
            "surface_pressure",
            "wind_speed_10m",
            "wind_direction_10m",
            "wind_gusts_10m",
            "uv_index"
        ].join(","),

        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "apparent_temperature_max",
            "apparent_temperature_min",
            "precipitation_sum",
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
            "daylight_duration"
        ].join(","),

        timezone: "auto",

        forecast_days: "14"

    });


    try {

        const response =
            await fetch(
                `${WEATHER_API}?${params}`
            );

        if (!response.ok)
            throw new Error("Błąd API");

        weather =
            await response.json();


        place = {
            lat,
            lon,
            name,
            country,
            ...metadata
        };


        render();


    } catch (error) {

        console.error(error);

        alert(
            "Nie udało się pobrać danych pogodowych."
        );

    }

}


/* RENDER */

function render() {

    renderCurrent();

    renderHourly();

    renderDaily();

    renderDetails();

    renderSun();

    renderLocation();

}


/* CURRENT */

function renderCurrent() {

    const c =
        weather.current;

    const [desc, icon] =
        weatherInfo(c.weather_code);


    document.getElementById(
        "city"
    ).textContent =
        place.name;


    document.getElementById(
        "country"
    ).textContent =
        place.country || "";


    document.getElementById(
        "date"
    ).textContent =
        date(c.time);


    document.getElementById(
        "temp"
    ).textContent =
        Math.round(c.temperature_2m);


    document.getElementById(
        "feels"
    ).textContent =
        Math.round(c.apparent_temperature)
        + "°C";


    document.getElementById(
        "description"
    ).textContent =
        desc;


    document.getElementById(
        "bigIcon"
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
        "gust"
    ).textContent =
        Math.round(c.wind_gusts_10m)
        + " km/h";


    document.getElementById(
        "windDir"
    ).textContent =
        windDirection(
            c.wind_direction_10m
        ) +
        " " +
        Math.round(
            c.wind_direction_10m
        ) +
        "°";


    document.getElementById(
        "pressure"
    ).textContent =
        Math.round(c.surface_pressure)
        + " hPa";


    document.getElementById(
        "clouds"
    ).textContent =
        c.cloud_cover + "%";


    document.getElementById(
        "visibility"
    ).textContent =
        (c.visibility / 1000).toFixed(1)
        + " km";


    document.getElementById(
        "uv"
    ).textContent =
        c.uv_index.toFixed(1);


    document.getElementById(
        "dew"
    ).textContent =
        c.dew_point_2m.toFixed(1)
        + "°C";


    document.getElementById(
        "precip"
    ).textContent =
        c.precipitation
        + " mm";


    document.getElementById(
        "updated"
    ).textContent =
        "Aktualizacja " +
        time(c.time);

}


/* HOURLY */

function renderHourly() {

    const box =
        document.getElementById(
            "hourly"
        );

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

        const [desc, icon] =
            weatherInfo(
                h.weather_code[i]
            );


        const div =
            document.createElement("div");

        div.className = "hour";

        if (i === start)
            div.classList.add("now");


        div.innerHTML = `

            <div class="hour-time">
                ${
                    i === start
                    ? "TERAZ"
                    : time(h.time[i])
                }
            </div>

            <div
                class="hour-icon"
                title="${desc}"
            >
                ${icon}
            </div>

            <div class="hour-temp">
                ${Math.round(
                    h.temperature_2m[i]
                )}°C
            </div>

            <div class="hour-rain">
                🌧️
                ${h.precipitation_probability[i] ?? 0}%
            </div>

        `;


        box.appendChild(div);

    }

}


/* 14 DNI */

function renderDaily() {

    const box =
        document.getElementById(
            "daily"
        );

    box.innerHTML = "";


    const d =
        weather.daily;


    for (let i = 0; i < 14; i++) {

        const [desc, icon] =
            weatherInfo(
                d.weather_code[i]
            );


        const dayName =
            i === 0
            ? "Dzisiaj"
            : new Date(
                d.time[i]
            ).toLocaleDateString(
                "pl-PL",
                {
                    weekday: "long"
                }
            );


        const div =
            document.createElement("div");

        div.className = "day";


        div.innerHTML = `

            <div>

                <div class="day-name">
                    ${dayName}
                </div>

                <div class="day-date">
                    ${shortDate(d.time[i])}
                </div>

            </div>

            <div class="day-icon">
                ${icon}
            </div>

            <div class="day-desc">
                ${desc}
            </div>

            <div class="day-temp">

                ${Math.round(
                    d.temperature_2m_max[i]
                )}°

                /

                ${Math.round(
                    d.temperature_2m_min[i]
                )}°C

            </div>

            <div class="day-rain">

                🌧️
                ${d.precipitation_probability_max[i] ?? 0}%

                <br>

                <small>
                    ${d.precipitation_sum[i]} mm
                </small>

            </div>

        `;


        box.appendChild(div);

    }

}


/* SZCZEGÓŁY */

function renderDetails() {

    const box =
        document.getElementById(
            "details"
        );

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

        const [desc, icon] =
            weatherInfo(
                h.weather_code[i]
            );


        const row =
            document.createElement("div");

        row.className = "detail";


        row.innerHTML = `

            <span>
                ${time(h.time[i])}
            </span>

            <span>
                ${icon}
            </span>

            <strong>
                ${Math.round(
                    h.temperature_2m[i]
                )}°C
            </strong>

            <span class="blue">
                🌧️
                ${h.precipitation_probability[i] ?? 0}%
            </span>

            <span class="optional">
                💨
                ${Math.round(
                    h.wind_speed_10m[i]
                )} km/h
            </span>

            <span class="optional">
                💧
                ${h.relative_humidity_2m[i]}%
            </span>

        `;


        box.appendChild(row);

    }

}


/* SŁOŃCE */

function renderSun() {

    const d =
        weather.daily;


    const sunrise =
        time(d.sunrise[0]);

    const sunset =
        time(d.sunset[0]);


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

function renderLocation() {

    document.getElementById(
        "infoCity"
    ).textContent =
        place.name;


    document.getElementById(
        "infoCountry"
    ).textContent =
        place.country || "-";


    document.getElementById(
        "coordinates"
    ).textContent =
        `${place.lat.toFixed(4)},
         ${place.lon.toFixed(4)}`;


    document.getElementById(
        "timezone"
    ).textContent =
        weather.timezone;


    document.getElementById(
        "elevation"
    ).textContent =
        weather.elevation
        ? Math.round(weather.elevation) + " m"
        : "-";

}


/* SZUKANIE */

const input =
    document.getElementById(
        "cityInput"
    );


input.addEventListener(
    "input",
    async () => {

        const query =
            input.value.trim();


        if (query.length < 3) {

            document.getElementById(
                "results"
            ).innerHTML = "";

            return;

        }


        try {

            const response =
                await fetch(
                    `${GEO_API}?name=${encodeURIComponent(query)}&count=6&language=pl&format=json`
                );


            const data =
                await response.json();


            const box =
                document.getElementById(
                    "results"
                );

            box.innerHTML = "";


            if (!data.results)
                return;


            data.results.forEach(
                result => {

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.className =
                        "result";


                    div.innerHTML = `
                        📍 <b>
                            ${result.name}
                        </b>
                        <span style="
                            color:#94a3b8;
                            margin-left:8px
                        ">
                            ${result.admin1 || ""}
                            ${result.country || ""}
                        </span>
                    `;


                    div.onclick = () => {

                        box.innerHTML = "";

                        input.value =
                            result.name;


                        loadWeather(
                            result.latitude,
                            result.longitude,
                            result.name,
                            result.country,
                            result
                        );

                    };


                    box.appendChild(div);

                }
            );


        } catch(error) {

            console.error(error);

        }

    }
);


/* ENTER */

input.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {

            const first =
                document.querySelector(
                    ".result"
                );

            if (first)
                first.click();

        }

    }
);


/* GPS */

document.getElementById(
    "gpsBtn"
).onclick = () => {

    if (!navigator.geolocation) {

        alert(
            "Ta przeglądarka nie obsługuje GPS."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        position => {

            loadWeather(
                position.coords.latitude,
                position.coords.longitude,
                "Moja lokalizacja",
                "",
                {}
            );

        },

        () => {

            alert(
                "Nie udało się pobrać lokalizacji."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 10000
        }

    );

};


/* ODŚWIEŻ */

document.getElementById(
    "refreshBtn"
).onclick = () => {

    if (!place)
        return;


    loadWeather(
        place.lat,
        place.lon,
        place.name,
        place.country,
        place
    );

};


/* START - WARSZAWA */

loadWeather(
    52.2297,
    21.0122,
    "Warszawa",
    "Polska",
    {
        admin1: "Mazowieckie"
    }
);


/* AUTOMATYCZNE ODŚWIEŻANIE */

setInterval(
    () => {

        if (!place)
            return;


        loadWeather(
            place.lat,
            place.lon,
            place.name,
            place.country,
            place
        );

    },
    15 * 60 * 1000
);
