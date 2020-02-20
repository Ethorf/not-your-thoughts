import { CHANGE_MODE } from '../actions/actionTypes';

const initialState = {
	mode: 'default'
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
