/* eslint-disable */
import axios from "axios";

export const login = async (email, password) => {
	try {
		const res = await axios({
			method: 'post',
			url: 'http://127.0.0.1:3000/api/v1/users/login',
			data: {
				email: email,
				password: password,
			},
		});
		if (res.data.status === 'success') {
			window.location.href = '/';
		}
		console.log(res);
	} catch (error) {
		alert(error);
	}
};


