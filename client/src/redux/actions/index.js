import { CHANGE_WORDCOUNT, GOAL_REACHED, CHANGE_GOAL, TOGGLE_EDIT_GOAL } from './actionTypes';

//I feel like these should actualy be reducers

export const changeWordCount = (payload) => (dispatch) => {
	dispatch({
		type: CHANGE_WORDCOUNT,
		payload
	});
};
export const changeGoal = (payload) => (dispatch) => {
	dispatch({
		type: CHANGE_GOAL,
		payload
	});
};

export const toggleEditGoal = (payload) => (dispatch) => {
	dispatch({
		type: TOGGLE_EDIT_GOAL,
		payload
	});
};

export const goalReached = () => (dispatch) => {
	dispatch({
		type: GOAL_REACHED
	});
};
