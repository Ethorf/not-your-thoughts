import { CHANGE_WORDCOUNT, GOAL_REACHED, CHANGE_GOAL, TOGGLE_EDIT_GOAL } from '../actions/actionTypes';

const initialState = {
	wordCount: 0,
	goalReachedStatus: false,
	goal: 600,
	goalIsEditable: false
};

function wordCountReducer(state = initialState, action) {
	switch (action.type) {
		case CHANGE_WORDCOUNT:
			return Object.assign({}, state, {
				wordCount: action.payload
			});
		case GOAL_REACHED:
			return {
				...state,
				goalReachedStatus: true
			};
		case CHANGE_GOAL:
			return Object.assign({}, state, {
				goal: action.payload
			});
		case TOGGLE_EDIT_GOAL:
			if (state.goalIsEditable === false) {
				return {
					...state,
					goalIsEditable: true
				};
			} else if (state.goalIsEditable === true) {
				return {
					...state,
					goalIsEditable: false
				};
			}

		default:
			return state;
	}
}

export default wordCountReducer;
