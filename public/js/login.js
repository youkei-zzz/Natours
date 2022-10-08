import { showAlert } from './alert.js';

export const login = async (email, password) => {
	const ajax = new XMLHttpRequest();
	ajax.open('POST', 'http://127.0.0.1:3000/api/v1/users/login');
	ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	ajax.send(`email=${email}&password=${password}`);
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4) {
			if (ajax.status === 200 && ajax.status < 300) {
				showAlert('success', 'Loged in successfully!');
				window.location.href = '/';
			} else {
				showAlert('error', JSON.parse(ajax.responseText).message);
			}
		}
	};
};

export const logout = () => {
	const ajax = new XMLHttpRequest();
	ajax.open('GET', 'http://127.0.0.1:3000/api/v1/users/logout');
	ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	ajax.send();
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4) {
			if (ajax.status === 200 && ajax.status < 300) {
				showAlert('success', 'Logged out successfully!');
				location.reload(true);
			} else {
				showAlert('error', JSON.parse(ajax.responseText).message);
			}
		}
	};
};
