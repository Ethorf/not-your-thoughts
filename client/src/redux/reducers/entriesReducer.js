import { SAVE_ENTRY, DELETE_ENTRY, SET_ENTRY, GET_ENTRIES, ENTRIES_ERROR } from '../actions/actionTypes';

const initialState = {
	entries: [],
	entry: '',
	loading: true
};

export default function(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case GET_ENTRIES:
			return {
				...state,
				entries: payload.entries,
				loading: false
			};
		case SAVE_ENTRY:
			return {
				...state,
				entries: [payload, ...state.entries]
			};
		case DELETE_ENTRY:
			return {
				...state,
				loading: true,
				entries: state.entries.filter((entry) => entry.id !== payload)
			};
		case SET_ENTRY:
			return {
				...state,
				entry: payload
			};
		case ENTRIES_ERROR:
			return {
				...state
			};
		default:
			return state;
	}
}
