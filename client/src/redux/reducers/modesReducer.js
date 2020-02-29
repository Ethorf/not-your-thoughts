import { CHANGE_MODE } from '../actions/actionTypes';

const initialState = {
	mode: ''
};

function modesReducer(state = initialState, action) {
	switch (action.type) {
		case CHANGE_MODE:
			return {
				...state,
				mode: action.payload
			};

		default:
			return state;
	}
}

export default modesReducer;
