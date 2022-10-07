export default async (email, password) => {
	try {
		const ajax = new XMLHttpRequest();
		ajax.open('POST', 'http://127.0.0.1:3000/api/v1/users/login');
		ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		ajax.send(`email=${email}&password=${password}`);
		ajax.onreadystatechange = function () {
			if (ajax.readyState === 4) {
				if (ajax.status === 200 && ajax.status < 300) {
					console.log(ajax.response);
					
				}
			}
		};

		window.location.href = '/';
	} catch (error) {
		alert(error);
	}
};
