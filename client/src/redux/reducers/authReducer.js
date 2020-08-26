import {
	REGISTER_SUCCESS,
	REGISTER_FAIL,
	USER_LOADED,
	AUTH_ERROR,
	LOGIN_SUCCESS,
	LOGIN_FAIL,
	LOGOUT,
	INCREASE_DAYS,
	SET_FIRST_LOGIN,
	TOGGLE_PROGRESS_AUDIO,
	TOGGLE_GUEST_MODE,
	ADD_CUSTOM_PROMPT,
	TOGGLE_CUSTOM_PROMPTS_ENABLED
} from '../actions/actionTypes';

const initialState = {
	token: localStorage.getItem('token'),
	isAuthenticated: null,
	loading: true,
	user: null,
	guestMode: false
};

export default function (state = initialState, action) {
	const { type, payload } = action;
	switch (type) {
		case USER_LOADED:
			return {
				...state,
				isAuthenticated: true,
				loading: false,
				user: payload
			};
		case INCREASE_DAYS:
		case SET_FIRST_LOGIN:
		case TOGGLE_PROGRESS_AUDIO:
		case TOGGLE_CUSTOM_PROMPTS_ENABLED:
			return {
				...state
			};
		case TOGGLE_GUEST_MODE:
			return {
				...state,
				guestMode: !state.guestMode
			};
		case REGISTER_SUCCESS:
		case LOGIN_SUCCESS:
			localStorage.setItem('token', payload.token);
			return {
				...state,
				...payload,
				isAuthenticated: true,
				loading: false
			};
		case REGISTER_FAIL:
		case AUTH_ERROR:
		case LOGIN_FAIL:
		case LOGOUT:
			localStorage.removeItem('token');
			return {
				...state,
				token: null,
				isAuthenticated: false,
				loading: false
			};
		default:
			return state;
	}
}
