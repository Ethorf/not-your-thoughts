import { SAVE_ENTRY, DELETE_ENTRY, SET_ENTRY, GET_ENTRIES, ENTRIES_ERROR } from '../actions/actionTypes';

const initialState = {
	entries: [],
	entry: '',
	loading: true
};

//This is where we say what we are giving to our state and update the object
//even though it's kind of mundane, most of the logic is done outside of here in the actions
//It's making me think like this is the end of a funnel for the info/data

export default function(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case GET_ENTRIES:
			return {
				...state,
				entries: payload.entries,
				loading: false
			};
		//this below part seems a little fucky perhaps?
		// I guess i'm a little confused on spread still, but I
		// interpret this to be add the payload from the action to everything allready in state.entries

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
