/* ==========================================
   MapPL 3.0 PRO ULTRA PLUS
   ========================================== */


// ==========================================
// MAPA
// ==========================================

const map = L.map("map", {
    zoomControl: false
}).setView(
    [52.2297, 21.0122],
    6
);


// ==========================================
// WARSTWY MAPY
// ==========================================

const layers = {

    normal: L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors'
        }
    ),

    hot: L.tileLayer(
        "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; OpenStreetMap contributors, Tiles style by HOT'
        }
    )

};


layers.normal.addTo(map);


// ==========================================
// ZMIENNE
// ==========================================

let userMarker = null;

let selectedPosition = null;

let routeControl = null;

let currentTravelMode = "driving";

let history =
    JSON.parse(
        localStorage.getItem("mappl_history") || "[]"
    );

let favorites =
    JSON.parse(
        localStorage.getItem("mappl_favorites") || "[]"
    );


// ==========================================
// ELEMENTY
// ==========================================

const sidePanel =
    document.getElementById("sidePanel");

const routePanel =
    document.getElementById("routePanel");

const markerPanel =
    document.getElementById("markerPanel");

const layerPanel =
    document.getElementById("layerPanel");

const results =
    document.getElementById("results");


// ==========================================
// MENU
// ==========================================

document.getElementById("menuButton").onclick =
() => {

    sidePanel.classList.toggle("open");

};


document.getElementById("closePanel").onclick =
() => {

    sidePanel.classList.remove("open");

};


// ==========================================
// ZOOM
// ==========================================

document.getElementById("plus").onclick =
() => map.zoomIn();


document.getElementById("minus").onclick =
() => map.zoomOut();


// ==========================================
// LOKALIZACJA
// ==========================================

document.getElementById("locate").onclick =
() => {

    if (!navigator.geolocation) {

        toast(
            "Twoja przeglądarka nie obsługuje GPS."
        );

        return;
    }


    toast("📍 Pobieranie lokalizacji...");


    navigator.geolocation.getCurrentPosition(

        position => {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            map.setView(
                [lat, lon],
                16
            );


            if (userMarker) {

                map.removeLayer(userMarker);

            }


            userMarker =
                L.marker([lat, lon])
                    .addTo(map)
                    .bindPopup(
                        "<b>📍 Twoja lokalizacja</b>"
                    )
                    .openPopup();


            toast(
                "📍 Lokalizacja znaleziona!"
            );

        },

        () => {

            toast(
                "❌ Nie udało się pobrać GPS."
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 10000
        }

    );

};


// ==========================================
// KOMPAS
// ==========================================

document.getElementById("compass").onclick =
() => {

    map.setBearing?.(0);

    toast("🧭 Północ");

};


// ==========================================
// WYSZUKIWANIE
// ==========================================

async function searchPlace() {

    const input =
        document.getElementById("search");

    const query =
        input.value.trim();


    if (!query) {

        toast("Wpisz miejsce.");

        return;
    }


    results.innerHTML =
        `<div class="result">
            🔎 Szukanie: ${escapeHTML(query)}
        </div>`;


    try {

        const url =
            "https://nominatim.openstreetmap.org/search" +
            "?format=json" +
            "&limit=8" +
            "&addressdetails=1" +
            "&q=" +
            encodeURIComponent(query);


        const response =
            await fetch(url);


        const data =
            await response.json();


        results.innerHTML = "";


        if (!data.length) {

            results.innerHTML =
                `<div class="result">
                    ❌ Nie znaleziono miejsca
                </div>`;

            return;
        }


        data.forEach(place => {

            const item =
                document.createElement("div");


            item.className =
                "result";


            item.innerHTML =
                `
                <strong>
                    📍 ${escapeHTML(
                        place.display_name.split(",")[0]
                    )}
                </strong>
                <br>
                <small>
                    ${escapeHTML(place.display_name)}
                </small>
                `;


            item.onclick = () => {

                const lat =
                    Number(place.lat);

                const lon =
                    Number(place.lon);


                map.setView(
                    [lat, lon],
                    16
                );


                const marker =
                    L.marker([lat, lon])
                        .addTo(map);


                marker.bindPopup(
                    `
                    <b>
                        ${escapeHTML(
                            place.display_name
                        )}
                    </b>
                    <br><br>
                    <button
                        onclick="addFavorite(
                            ${lat},
                            ${lon},
                            '${escapeJS(
                                place.display_name
                            )}'
                        )"
                    >
                        ⭐ Dodaj do ulubionych
                    </button>
                    `
                ).openPopup();


                saveHistory(
                    place.display_name,
                    lat,
                    lon
                );


                results.innerHTML = "";

            };


            results.appendChild(item);

        });

    }

    catch {

        results.innerHTML =
            `<div class="result">
                ⚠️ Błąd wyszukiwania
            </div>`;

    }

}


document
    .getElementById("searchButton")
    .onclick = searchPlace;


document
    .getElementById("search")
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                searchPlace();

            }

        }
    );


// ==========================================
// HISTORIA
// ==========================================

function saveHistory(
    name,
    lat,
    lon
) {

    history.unshift({

        name,
        lat,
        lon,

        time:
            new Date().toLocaleString("pl-PL")

    });


    history =
        history.slice(0, 30);


    localStorage.setItem(
        "mappl_history",
        JSON.stringify(history)
    );

}


// ==========================================
// ULUBIONE
// ==========================================

function addFavorite(
    lat,
    lon,
    name
) {

    favorites.push({

        name,
        lat,
        lon

    });


    localStorage.setItem(
        "mappl_favorites",
        JSON.stringify(favorites)
    );


    toast(
        "⭐ Dodano do ulubionych!"
    );

}


window.addFavorite =
    addFavorite;


// ==========================================
// MARKER
// ==========================================

document.getElementById("addMarker").onclick =
() => {

    markerPanel.classList.add("open");

    toast(
        "📌 Kliknij miejsce na mapie."
    );

};


map.on(
    "click",
    event => {

        selectedPosition =
            event.latlng;

    }
);


document.getElementById("saveMarker").onclick =
() => {

    if (!selectedPosition) {

        toast(
            "Najpierw kliknij na mapę."
        );

        return;
    }


    const name =
        document
            .getElementById("markerName")
            .value
            .trim()
        || "Moje miejsce";


    L.marker(
        selectedPosition
    )
    .addTo(map)
    .bindPopup(
        `
        <b>📌 ${escapeHTML(name)}</b>
        <br>
        MapPL
        `
    )
    .openPopup();


    document
        .getElementById("markerName")
        .value = "";


    selectedPosition = null;

    markerPanel.classList.remove("open");

    toast(
        "📌 Marker dodany!"
    );

};


document.getElementById("closeMarker").onclick =
() => {

    markerPanel.classList.remove("open");

};


// ==========================================
// TRASA
// ==========================================

document.getElementById("route").onclick =
() => {

    routePanel.classList.add("open");

};


document.getElementById("closeRoute").onclick =
() => {

    routePanel.classList.remove("open");

};


document
    .querySelectorAll(".travel")
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(".travel")
                .forEach(
                    x => x.classList.remove("active")
                );


            button.classList.add("active");


            currentTravelMode =
                button.dataset.mode;

        };

    });


// ==========================================
// GEOCODING
// ==========================================

async function geocode(address) {

    const url =
        "https://nominatim.openstreetmap.org/search" +
        "?format=json" +
        "&limit=1" +
        "&q=" +
        encodeURIComponent(address);


    const response =
        await fetch(url);


    const data =
        await response.json();


    if (!data.length) {

        return null;

    }


    return {

        lat: Number(data[0].lat),

        lon: Number(data[0].lon)

    };

}


// ==========================================
// TRASA
// ==========================================

document
    .getElementById("calculate")
    .onclick =
    async () => {

        const start =
            document
                .getElementById("routeStart")
                .value
                .trim();


        const end =
            document
                .getElementById("routeEnd")
                .value
                .trim();


        const info =
            document.getElementById("routeInfo");


        if (!start || !end) {

            info.innerHTML =
                "⚠️ Wpisz początek i cel.";

            return;

        }


        info.innerHTML =
            "🔎 Szukanie punktów...";


        try {

            const a =
                await geocode(start);


            const b =
                await geocode(end);


            if (!a || !b) {

                info.innerHTML =
                    "❌ Nie znaleziono punktu.";

                return;

            }


            if (routeControl) {

                map.removeControl(
                    routeControl
                );

            }


            let profile =
                "car";


            if (
                currentTravelMode ===
                "walking"
            ) {

                profile = "foot";

            }


            if (
                currentTravelMode ===
                "cycling"
            ) {

                profile = "bike";

            }


            routeControl =
                L.Routing.control({

                    waypoints: [

                        L.latLng(
                            a.lat,
                            a.lon
                        ),

                        L.latLng(
                            b.lat,
                            b.lon
                        )

                    ],

                    router:
                        L.Routing.osrmv1({

                            serviceUrl:
                                "https://router.project-osrm.org/route/v1"

                        }),

                    showAlternatives: true,

                    addWaypoints: false,

                    draggableWaypoints: false,

                    fitSelectedRoutes: true,

                    createMarker: () => null,

                    lineOptions: {

                        styles: [
                            {
                                weight: 7
                            }
                        ]

                    }

                }).addTo(map);


            routeControl.on(
                "routesfound",
                event => {

                    const route =
                        event.routes[0];


                    const km =
                        (
                            route.summary.totalDistance
                            / 1000
                        ).toFixed(1);


                    const min =
                        Math.round(
                            route.summary.totalTime
                            / 60
                        );


                    info.innerHTML =
                        `
                        🚗 <b>Trasa gotowa</b>
                        <br><br>
                        📏 ${km} km
                        <br>
                        ⏱️ około ${min} min
                        `;

                }
            );


        }

        catch {

            info.innerHTML =
                "⚠️ Błąd wyznaczania trasy.";

        }

    };


// ==========================================
// WARSTWY
// ==========================================

document.getElementById("layers").onclick =
() => {

    layerPanel.classList.add("open");

};


document.getElementById("closeLayers").onclick =
() => {

    layerPanel.classList.remove("open");

};


document
    .querySelectorAll(".layer")
    .forEach(button => {

        button.onclick = () => {

            const type =
                button.dataset.layer;


            Object.values(layers)
                .forEach(layer => {

                    if (map.hasLayer(layer)) {

                        map.removeLayer(layer);

                    }

                });


            if (type === "normal") {

                layers.normal.addTo(map);

            }


            if (type === "hot") {

                layers.hot.addTo(map);

            }


            if (type === "dark") {

                layers.normal.addTo(map);

                document.body.style.filter =
                    "invert(.9) hue-rotate(180deg)";

            }
            else {

                document.body.style.filter =
                    "none";

            }


            layerPanel.classList.remove(
                "open"
            );

        };

    });


// ==========================================
// FULLSCREEN
// ==========================================

document.getElementById("full").onclick =
async () => {

    if (!document.fullscreenElement) {

        await document.documentElement
            .requestFullscreen();

    }
    else {

        await document.exitFullscreen();

    }

};


// ==========================================
// MENU SEKCJE
// ==========================================

document
    .querySelectorAll(".menuItem")
    .forEach(button => {

        button.onclick = () => {

            document
                .querySelectorAll(".menuItem")
                .forEach(
                    x => x.classList.remove("active")
                );


            button.classList.add("active");


            const section =
                button.dataset.section;


            if (section === "route") {

                routePanel.classList.add(
                    "open"
                );

            }


            if (section === "saved") {

                showFavorites();

            }


            if (section === "history") {

                showHistory();

            }


            if (section === "home") {

                map.setView(
                    [52.2297, 21.0122],
                    6
                );

            }

        };

    });


// ==========================================
// ULUBIONE - WIDOK
// ==========================================

function showFavorites() {

    if (!favorites.length) {

        toast(
            "⭐ Nie masz jeszcze ulubionych."
        );

        return;

    }


    results.innerHTML = "";


    favorites.forEach(item => {

        const div =
            document.createElement("div");


        div.className = "result";


        div.innerHTML =
            `
            ⭐ <b>${escapeHTML(
                item.name
            )}</b>
            <br>
            <small>
                Kliknij, aby przejść
            </small>
            `;


        div.onclick = () => {

            map.setView(
                [
                    item.lat,
                    item.lon
                ],
                16
            );


            L.marker([
                item.lat,
                item.lon
            ])
            .addTo(map)
            .bindPopup(
                escapeHTML(item.name)
            )
            .openPopup();


            results.innerHTML = "";

        };


        results.appendChild(div);

    });

}


// ==========================================
// HISTORIA - WIDOK
// ==========================================

function showHistory() {

    if (!history.length) {

        toast(
            "🕘 Historia jest pusta."
        );

        return;

    }


    results.innerHTML = "";


    history.forEach(item => {

        const div =
            document.createElement("div");


        div.className =
            "result";


        div.innerHTML =
            `
            🕘 <b>
                ${escapeHTML(item.name)}
            </b>
            <br>
            <small>
                ${item.time}
            </small>
            `;


        div.onclick = () => {

            map.setView(
                [
                    item.lat,
                    item.lon
                ],
                16
            );


            results.innerHTML = "";

        };


        results.appendChild(div);

    });

}


// ==========================================
// TOAST
// ==========================================

function toast(message) {

    const element =
        document.getElementById("toast");


    element.textContent =
        message;


    element.style.display =
        "block";


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            () => {

                element.style.display =
                    "none";

            },
            2500
        );

}


// ==========================================
// BEZPIECZEŃSTWO TEKSTU
// ==========================================

function escapeHTML(text) {

    return String(text)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeJS(text) {

    return String(text)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", " ");

}


// ==========================================
// START
// ==========================================

toast(
    "🗺️ Witaj w MapPL 3.0 PRO ULTRA PLUS!"
);
