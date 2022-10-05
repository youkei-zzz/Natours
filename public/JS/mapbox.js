/* eslint-disable prefer-destructuring */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

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
