import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';
import { SAVE_ENTRY, DELETE_ENTRY, GET_ENTRIES, ENTRIES_ERROR, SET_ENTRY } from './actionTypes';

// Get Entries
export const getEntries = () => async (dispatch) => {
	if (localStorage.token) {
		setAuthToken(localStorage.token);
	}
	try {
		const res = await axios.get('/api/auth');
		dispatch({
			type: GET_ENTRIES,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: ENTRIES_ERROR
		});
	}
};
//Entry Actions
export const saveEntry = ({ entry }) => async (dispatch) => {
	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};
	const body = JSON.stringify({ entry });
	try {
		const res = await axios.post('/api/updateUser', body, config);
		dispatch({
			type: SAVE_ENTRY,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: ENTRIES_ERROR
		});
	}
};

export const deleteEntry = (id) => async (dispatch) => {
	try {
		const res = await axios.delete(`/api/updateUser/${id}`);
		dispatch({
			type: DELETE_ENTRY,
			payload: id
		});
		dispatch({
			type: GET_ENTRIES,
			payload: res.data
		});
	} catch (err) {
		dispatch({
			type: ENTRIES_ERROR
		});
	}
};

export const setEntry = (payload) => (dispatch) => {
	dispatch({
		type: SET_ENTRY,
		payload
	});
};
