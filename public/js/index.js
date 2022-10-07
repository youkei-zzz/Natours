import login from './login.js';
import displayMap from './mapbox.js';

console.log('hello world');

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');

if (mapBox) {
	const locations = JSON.parse(mapBox.dataset.locations);
	displayMap(locations);
	console.log(locations);
}

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	});
} 
