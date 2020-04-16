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
	TOGGLE_ADD_PROMPT_OPEN,
	ADD_CUSTOM_PROMPT,
	TOGGLE_CUSTOM_PROMPTS_ENABLED
} from '../actions/actionTypes';

const initialState = {
	token: localStorage.getItem('token'),
	isAuthenticated: null,
	loading: true,
	user: null,
	addPromptOpen: false,
	customPromptsEnabled: false
};
//Okay now I am confused about this as a boik I have absolutely nothing going on with my reducer yet I can add my prompts
export default function (state = initialState, action) {
	const { type, payload } = action;
	switch (type) {
		case USER_LOADED:
			return {
				...state,
				isAuthenticated: true,
				loading: false,
				user: payload,
				customPromptsEnabled: payload.customPromptsEnabled
			};
		case INCREASE_DAYS:
		case SET_FIRST_LOGIN:
		case TOGGLE_PROGRESS_AUDIO:
			return {
				...state
			};
		case TOGGLE_ADD_PROMPT_OPEN:
			if (state.addPromptOpen === false) {
				return {
					...state,
					addPromptOpen: true
				};
			} else if (state.addPromptOpen === true) {
				return {
					...state,
					addPromptOpen: false
				};
			}
		case TOGGLE_CUSTOM_PROMPTS_ENABLED:
			return {
				...state
			};
		// if (state.user.customPromptsEnabled === false) {
		// 	return {
		// 		...state,
		// 		customPromptsEnabled: true
		// 	};
		// } else if (state.user.customPromptsEnabled === true) {
		// 	return {
		// 		...state,
		// 		customPromptsEnabled: false
		// 	};
		// }
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
//maybe with that recently deleted problem I need to rethink the order of how things proceed through the
//redux flow
