import {
	CHANGE_WORDCOUNT,
	CHANGE_CHARCOUNT,
	GOAL_REACHED,
	SET_NEW_GOAL,
	CHANGE_GOAL,
	TOGGLE_EDIT_GOAL
} from '../actions/actionTypes';

const initialState = {
	wordCount: 0,
	charCount: 0,
	goalReachedStatus: false,
	goal: 400,
	newGoal: 0,
	goalIsEditable: false
};

function wordCountReducer(state = initialState, action) {
	const { type, payload } = action;

	switch (type) {
		case CHANGE_WORDCOUNT:
			return { ...state, wordCount: payload };
		case CHANGE_CHARCOUNT:
			return { ...state, charCount: payload };
		case GOAL_REACHED:
			return {
				...state,
				goalReachedStatus: true
			};
		case SET_NEW_GOAL:
			return { ...state, newGoal: payload };
		case CHANGE_GOAL:
			return { ...state, goal: payload };
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
