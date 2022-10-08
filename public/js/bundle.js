const $fc9f18cd978afa5b$export$516836c6a9dfc573 = ()=>{
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
};
const $fc9f18cd978afa5b$export$de026b00723010c1 = (type, message)=>{
    const markup = document.createElement("div");
    markup.className = `alert alert--${type}`;
    markup.innerHTML = message;
    document.querySelector("body").insertAdjacentElement("afterbegin", markup);
    window.setTimeout($fc9f18cd978afa5b$export$516836c6a9dfc573, 4000);
};


const $e33d9ff231aec008$export$596d806903d1f59e = async (email, password)=>{
    const ajax = new XMLHttpRequest();
    ajax.open("POST", "http://127.0.0.1:3000/api/v1/users/login");
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send(`email=${email}&password=${password}`);
    ajax.onreadystatechange = function() {
        if (ajax.readyState === 4) {
            if (ajax.status === 200 && ajax.status < 300) {
                (0, $fc9f18cd978afa5b$export$de026b00723010c1)("success", "Loged in successfully!");
                window.location.href = "/";
            } else (0, $fc9f18cd978afa5b$export$de026b00723010c1)("error", JSON.parse(ajax.responseText).message);
        }
    };
};
const $e33d9ff231aec008$export$a0973bcfe11b05c9 = ()=>{
    const ajax = new XMLHttpRequest();
    ajax.open("GET", "http://127.0.0.1:3000/api/v1/users/logout");
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    ajax.send();
    ajax.onreadystatechange = function() {
        if (ajax.readyState === 4) {
            if (ajax.status === 200 && ajax.status < 300) {
                (0, $fc9f18cd978afa5b$export$de026b00723010c1)("success", "Logged out successfully!");
                location.reload(true);
            } else (0, $fc9f18cd978afa5b$export$de026b00723010c1)("error", JSON.parse(ajax.responseText).message);
        }
    };
};


var $f6b1c9ed51ec7162$export$2e2bcd8739ae039 = (locations)=>{
    mapboxgl.accessToken = "pk.eyJ1IjoieW91bmMiLCJhIjoiY2w4dmttNGg3MGVyeTNwbnplNHM3ang2bSJ9.-8F3B-715qLzIO7CW7hm3A";
    var map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v11",
        scrollZoom: false,
        zoom: 0.8
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc)=>{
        // create a Marker
        const el = document.createElement("div");
        el.className = "marker";
        // add the marker
        new mapboxgl.Marker({
            element: el,
            anchor: "bottom"
        }).setLngLat(loc.coordinates).addTo(map);
        // Add popup
        new mapboxgl.Popup({
            offset: 30
        }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
        // extend map bounds to include current location
        bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 50,
            right: 50
        }
    });
};


console.log("hello world");
const $1cd085a7ac742057$var$mapBox = document.getElementById("map");
const $1cd085a7ac742057$var$loginForm = document.querySelector(".form--login");
const $1cd085a7ac742057$var$logoutButton = document.querySelector(".nav__el--logout");
if ($1cd085a7ac742057$var$mapBox) {
    const locations = JSON.parse($1cd085a7ac742057$var$mapBox.dataset.locations);
    (0, $f6b1c9ed51ec7162$export$2e2bcd8739ae039)(locations);
}
if ($1cd085a7ac742057$var$loginForm) $1cd085a7ac742057$var$loginForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    (0, $e33d9ff231aec008$export$596d806903d1f59e)(email, password);
});
if ($1cd085a7ac742057$var$logoutButton) $1cd085a7ac742057$var$logoutButton.addEventListener("click", (e)=>{
    e.preventDefault();
    (0, $e33d9ff231aec008$export$a0973bcfe11b05c9)();
});


//# sourceMappingURL=bundle.js.map
