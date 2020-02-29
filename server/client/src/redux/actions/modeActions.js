import { CHANGE_MODE } from './actionTypes';

export const changeMode = (payload) => (dispatch) => {
	dispatch({
		type: CHANGE_MODE,
		payload: payload
	});
};
