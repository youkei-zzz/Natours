var $e33d9ff231aec008$export$2e2bcd8739ae039 = async (email, password) => {
	try {
		const ajax = new XMLHttpRequest();
		ajax.open('POST', 'http://127.0.0.1:3000/api/v1/users/login');
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		ajax.send(`email=${email}&password=${password}`);
		ajax.onreadystatechange = function () {
			if (ajax.readyState === 4) {
				if (ajax.status === 200 && ajax.status < 400) {
                    console.log('----------------------------------------------------------------')
					console.log(ajax.response);
					window.location.href = '/';
				}
			}
		};
	} catch (error) {
		alert(error);
	}
};

var $f6b1c9ed51ec7162$export$2e2bcd8739ae039 = locations => {
	mapboxgl.accessToken =
		'pk.eyJ1IjoieW91bmMiLCJhIjoiY2w4dmttNGg3MGVyeTNwbnplNHM3ang2bSJ9.-8F3B-715qLzIO7CW7hm3A';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v11',
		scrollZoom: false,
		zoom: 0.8,
	});
	const bounds = new mapboxgl.LngLatBounds();
	locations.forEach(loc => {
		// create a Marker
		const el = document.createElement('div');
		el.className = 'marker';
		// add the marker
		new mapboxgl.Marker({
			element: el,
			anchor: 'bottom',
		})
			.setLngLat(loc.coordinates)
			.addTo(map);
		// Add popup
		new mapboxgl.Popup({
			offset: 30,
		})
			.setLngLat(loc.coordinates)
			.setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
			.addTo(map);
		// extend map bounds to include current location
		bounds.extend(loc.coordinates);
	});
	map.fitBounds(bounds, {
		padding: {
			top: 200,
			bottom: 150,
			left: 50,
			right: 50,
		},
	});
};

console.log('hello world');
const $1cd085a7ac742057$var$mapBox = document.getElementById('map');
const $1cd085a7ac742057$var$loginForm = document.querySelector('.form--login');
if ($1cd085a7ac742057$var$mapBox) {
	const locations = JSON.parse($1cd085a7ac742057$var$mapBox.dataset.locations);
	(0, $f6b1c9ed51ec7162$export$2e2bcd8739ae039)(locations);
	console.log(locations);
}
if ($1cd085a7ac742057$var$loginForm)
	$1cd085a7ac742057$var$loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		(0, $e33d9ff231aec008$export$2e2bcd8739ae039)(email, password);
	});

//# sourceMappingURL=bundle.js.map
