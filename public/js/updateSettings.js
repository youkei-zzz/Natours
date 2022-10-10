import { showAlert } from './alert.js';

export default (data, type) => {
	const ajax = new XMLHttpRequest();
	const url =
		type === 'password'
			? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
			: 'http://127.0.0.1:3000/api/v1/users/updateMe';
	ajax.open('PATCH', url);
	ajax.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
	ajax.send(JSON.stringify(data));
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4) {
			if (ajax.status === 200 && ajax.status < 400) {
				showAlert('success', `${type.toUpperCase()} updating successfully!`);
			} else {
				showAlert('error', JSON.parse(ajax.responseText).message);
			}
		}
	};
};
