// =====================================
// WINDY PL 1.0
// =====================================


// MAPA
const map = L.map("map").setView([52.1, 19.4], 6);


// MAPA OPENSTREETMAP
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }
).addTo(map);


// ZNACZNIK
let marker;


// =====================================
// POBIERANIE POGODY
// =====================================

async function getWeather(lat, lon, name = "Wybrane miejsce") {

    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,precipitation,cloud_cover,wind_speed_10m` +
            `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
            `&timezone=auto`;

        const response = await fetch(url);

        const data = await response.json();


        // NAZWA
        document.getElementById("location").textContent = name;


        // AKTUALNA TEMPERATURA
        document.getElementById("temperature").textContent =
            Math.round(data.current.temperature_2m);


        // WIATR
        document.getElementById("wind").textContent =
            Math.round(data.current.wind_speed_10m);


        // WILGOTNOŚĆ
        document.getElementById("humidity").textContent =
            data.current.relative_humidity_2m + "%";


        // OPADY
        document.getElementById("rain").textContent =
            data.current.precipitation + " mm";


        // ZACHMURZENIE
        document.getElementById("clouds").textContent =
            data.current.cloud_cover + "%";


        // PROGNOZA
        showForecast(data.daily);


    } catch (error) {

        console.error(error);

        alert("Nie udało się pobrać pogody.");

    }
}


// =====================================
// PROGNOZA
// =====================================

function showForecast(daily) {

    const container =
        document.getElementById("forecastList");

    container.innerHTML = "";


    for (let i = 0; i < daily.time.length; i++) {

        const date =
            new Date(daily.time[i]);


        const day =
            date.toLocaleDateString(
                "pl-PL",
                {
                    weekday: "short",
                    day: "numeric",
                    month: "short"
                }
            );


        const max =
            Math.round(daily.temperature_2m_max[i]);


        const min =
            Math.round(daily.temperature_2m_min[i]);


        const rain =
            daily.precipitation_sum[i];


        const weather =
            getWeatherIcon(
                daily.weather_code[i]
            );


        const div =
            document.createElement("div");


        div.className =
            "forecast-day";


        div.innerHTML = `

            <span>${day}</span>

            <span>${weather}</span>

            <b>
                ${max}° / ${min}°
            </b>

            <span>
                🌧️ ${rain} mm
            </span>

        `;


        container.appendChild(div);

    }

}


// =====================================
// IKONY POGODY
// =====================================

function getWeatherIcon(code) {

    if (code === 0)
        return "☀️";

    if (code === 1 || code === 2)
        return "🌤️";

    if (code === 3)
        return "☁️";

    if (code >= 45 && code <= 48)
        return "🌫️";

    if (code >= 51 && code <= 67)
        return "🌧️";

    if (code >= 71 && code <= 77)
        return "❄️";

    if (code >= 80 && code <= 82)
        return "🌦️";

    if (code >= 95)
        return "⛈️";

    return "🌡️";
}


// =====================================
// KLIKNIĘCIE MAPY
// =====================================

map.on("click", async function(e) {

    const lat =
        e.latlng.lat;

    const lon =
        e.latlng.lng;


    if (marker) {
        map.removeLayer(marker);
    }


    marker =
        L.marker([lat, lon])
        .addTo(map);


    marker.bindPopup(
        "🌦️ Pobieram pogodę..."
    ).openPopup();


    getWeather(
        lat,
        lon,
        `📍 ${lat.toFixed(2)}, ${lon.toFixed(2)}`
    );

});


// =====================================
// WYSZUKIWANIE MIASTA
// =====================================

async function searchCity() {

    const city =
        document.getElementById("cityInput").value.trim();


    if (!city) {

        alert("Wpisz nazwę miasta.");

        return;

    }


    try {

        const url =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pl&format=json`;


        const response =
            await fetch(url);


        const data =
            await response.json();


        if (!data.results || data.results.length === 0) {

            alert("Nie znaleziono miasta.");

            return;

        }


        const result =
            data.results[0];


        const lat =
            result.latitude;


        const lon =
            result.longitude;


        const name =
            result.name;


        map.setView(
            [lat, lon],
            10
        );


        if (marker) {

            map.removeLayer(marker);

        }


        marker =
            L.marker([lat, lon])
            .addTo(map);


        marker
            .bindPopup(`📍 ${name}`)
            .openPopup();


        getWeather(
            lat,
            lon,
            `📍 ${name}`
        );


    } catch (error) {

        console.error(error);

        alert("Błąd wyszukiwania.");

    }

}


// =====================================
// ENTER W WYSZUKIWARCE
// =====================================

document
    .getElementById("cityInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                searchCity();

            }

        }
    );


// =====================================
// MOJA LOKALIZACJA
// =====================================

function getLocation() {

    if (!navigator.geolocation) {

        alert(
            "Twoja przeglądarka nie obsługuje lokalizacji."
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            map.setView(
                [lat, lon],
                10
            );


            if (marker) {

                map.removeLayer(marker);

            }


            marker =
                L.marker([lat, lon])
                .addTo(map);


            marker
                .bindPopup("📍 Twoja lokalizacja")
                .openPopup();


            getWeather(
                lat,
                lon,
                "📍 Twoja lokalizacja"
            );

        },

        function() {

            alert(
                "Nie udało się pobrać lokalizacji."
            );

        }

    );

}


// =====================================
// WARSTWY POGODOWE — WERSJA 1.0
// =====================================

function loadWeatherLayer(type) {

    let message = "";


    if (type === "temperature") {

        message =
            "🌡️ Warstwa temperatur będzie dostępna w kolejnej wersji.";

    }


    if (type === "wind") {

        message =
            "💨 Warstwa wiatru będzie dostępna w kolejnej wersji.";

    }


    if (type === "rain") {

        message =
            "🌧️ Radar opadów będzie dostępny w kolejnej wersji.";

    }


    alert(message);

}


// =====================================
// START — POLSKA
// =====================================

getWeather(
    52.1,
    19.4,
    "🇵🇱 Polska"
);
