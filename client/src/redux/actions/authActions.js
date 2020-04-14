import axios from 'axios';
import { setAlert } from './alert';
import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	USER_LOADED,
	AUTH_ERROR,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	INCREASE_DAYS,
	DAY_INCREASE_ERROR,
	SET_FIRST_LOGIN,
	TOGGLE_PROGRESS_AUDIO
} from './actionTypes';

import setAuthToken from '../../utils/setAuthToken';
// Load User
export const loadUser = () => async (dispatch) => {
	if (localStorage.token) {
		setAuthToken(localStorage.token);
	}
	try {
		const res = await axios.get('/api/auth');
		dispatch({
			type: USER_LOADED,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: AUTH_ERROR
		});
	}
};
// Register User
export const register = ({ name, email, password }) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};
	const body = JSON.stringify({ name, email, password });
	try {
		const res = await axios.post('/api/registerUser', body, config);
		dispatch({
			type: REGISTER_SUCCESS,
			payload: res.data
		});
		dispatch(loadUser());
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}
		dispatch({
			type: REGISTER_FAIL
		});
	}
};

// Login User
export const login = (email, password) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};
	const body = JSON.stringify({ email, password });
	try {
		const res = await axios.post('/api/auth', body, config);
		dispatch({
			type: LOGIN_SUCCESS,
			payload: res.data
		});

		dispatch(loadUser());
	} catch (err) {
		const errors = err.response.data.errors;

		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}
		dispatch({
			type: LOGIN_FAIL
		});
	}
};

// Logout / Clear Profile
export const logout = () => (dispatch) => {
	dispatch({ type: LOGOUT });
};

export const increaseDays = () => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json',
			'x-auth-token': localStorage.getItem('token')
		}
	};
	try {
		const res = await axios.post('/api/increaseDays', config);
		dispatch({
			type: INCREASE_DAYS,
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

export const setFirstLogin = () => async (dispatch) => {
	const config = {
		headers: {
			'x-auth-token': localStorage.getItem('token')
		}
	};
	try {
		const res = await axios.post('/api/setFirstLogin', config);
		dispatch({
			type: SET_FIRST_LOGIN,
			payload: res.data
		});
	} catch (err) {
		const errors = err.response.data.errors;
		if (errors) {
			errors.forEach((error) => dispatch(setAlert(error.msg, 'danger')));
		}
	}
};
export const toggleProgressAudio = () => async (dispatch) => {
	const config = {
		headers: {
			'x-auth-token': localStorage.getItem('token')
		}
	};
	try {
		const res = await axios.post('/api/updateUser/toggleAudio', config);
		dispatch({
			type: TOGGLE_PROGRESS_AUDIO,
			payload: res.data
		});
		console.log(res);
		//This Loaduser here is super essential to make sure the state updates, but is that bad?
		//A man does not know at this juncture
		dispatch(loadUser());
	} catch (err) {
		console.log('toggle error');
	}
};
