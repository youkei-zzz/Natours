import { login, logout } from './login.js';
import displayMap from './mapbox.js';
import updateSettings from './updateSettings.js';

console.log('hello world');

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

if (mapBox) {
	const locations = JSON.parse(mapBox.dataset.locations);
	displayMap(locations);
}

if (loginForm) {
	loginForm.addEventListener('submit', e => {
		e.preventDefault();
		const email = document.getElementById('email').value;
		const password = document.getElementById('password').value;
		login(email, password);
	});
}

if (logoutButton) {
	logoutButton.addEventListener('click', e => {
		e.preventDefault();
		logout();
	});
}
if (userDataForm) {
	userDataForm.addEventListener('submit', e => {
		console.log('😀😀😀😀');
		e.preventDefault();
		const email = document.getElementById('email').value;
		const name = document.getElementById('name').value;
		updateSettings({ name, email }, 'data');
	});
}
if (userPasswordForm) {
	userPasswordForm.addEventListener('submit', e => {
		e.preventDefault();
		const passwordCurrent = document.getElementById('password-current').value;
		const password = document.getElementById('password').value;
		const passwordConfirm = document.getElementById('password-confirm').value;
		updateSettings({ password, passwordCurrent, passwordConfirm }, 'password');
		document.getElementById('password-current').value = '';
		document.getElementById('password-confirm').value = '';
		document.getElementById('password').value = '';
	});
}
