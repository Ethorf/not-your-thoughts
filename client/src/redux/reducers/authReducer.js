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
	TOGGLE_PROGRESS_AUDIO
} from '../actions/actionTypes';

const initialState = {
	token: localStorage.getItem('token'),
	isAuthenticated: null,
	loading: true,
	user: null
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
			return {
				...state
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
//I guess What I'm really having trouble with is having my database info directly linked to state,
//maybe I should try separating both those layers. Okay so that wasn't the problem, the problem was literally just not importing / destructuring the function in the component
//but that then really fucks with me because that api request was still being made it just wasn't in the function props or whatever???? fuck
