import axios from 'axios';
import { setAlert } from './alert';
import { INCREASE_CON_DAYS, INCREASE_TOT_DAYS, SET_LAST_DAY_COMPLETE, DAY_INCREASE_ERROR } from './actionTypes';

//Increase User Consecutive Days

export const increaseConsecutiveDays = () => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json',
			'x-auth-token': localStorage.getItem('token')
		}
	};
	try {
		const res = await axios.post('/api/increaseDays', body, config);
		// const res = await axios.post('http://localhost:8082/api/increaseDays', body, config);

		dispatch({
			type: INCREASE_TOT_DAYS,
			payload: res.data
		});
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}
		dispatch({
			type: DAY_INCREASE_ERROR
		});
	}
};
