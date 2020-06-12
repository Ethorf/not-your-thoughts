import { SHUFFLE_PROMPT } from './actionTypes';

export const shufflePrompt = (payload) => (dispatch) => {
	dispatch({
		type: SHUFFLE_PROMPT,
		payload: payload
	});
};
