import axios from 'axios';
import {
	CHANGE_WORDCOUNT,
	GOAL_REACHED,
	CHANGE_GOAL,
	SET_NEW_GOAL,
	TOGGLE_EDIT_GOAL,
	SET_NEW_GOAL_ERROR
} from './actionTypes';
import { loadUser } from './authActions.js';

export const changeWordCount = (payload) => (dispatch) => {
	dispatch({
		type: CHANGE_WORDCOUNT,
		payload
	});
};
export const setNewGoal = (payload) => (dispatch) => {
	dispatch({
		type: SET_NEW_GOAL,
		payload
	});
};

export const changeGoal = (payload) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json',
			'x-auth-token': localStorage.getItem('token')
		}
	};
	const body = { goal: payload };
	try {
		const res = await axios.post('/api/updateUser/setNewWordsGoal', body, config);
		dispatch({
			type: CHANGE_GOAL,
			payload
		});
		dispatch(loadUser());
		console.log(res);
	} catch (err) {
		dispatch({
			type: SET_NEW_GOAL_ERROR
		});
		// console.log(res);
	}
};

export const toggleEditGoal = (payload) => (dispatch) => {
	dispatch({
		type: TOGGLE_EDIT_GOAL,
		payload
	});
};

export const goalReached = () => (dispatch) => {
	dispatch({
		type: GOAL_REACHED
	});
};
