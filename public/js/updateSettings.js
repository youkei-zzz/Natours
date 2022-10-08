import { showAlert } from './alert.js';

export default (name, email) => {
	const ajax = new XMLHttpRequest();
	ajax.open('PATCH', 'http://127.0.0.1:3000/api/v1/users/updateMe');
	ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	ajax.send(`name=${name}&email=${email}`);
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4) {
			if (ajax.status === 200 && ajax.status < 400) {
				showAlert('success', 'updating successfully!');
			} else {
				showAlert('error', JSON.parse(ajax.responseText).message);
			}
		}
	};
};
