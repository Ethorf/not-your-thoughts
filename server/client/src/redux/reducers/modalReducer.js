import {
	OPEN_SUCCESS_MODAL,
	CLOSE_SUCCESS_MODAL,
	CLOSE_SAVE_ENTRY_MODAL,
	OPEN_SAVE_ENTRY_MODAL
} from '../actions/actionTypes';

const initialState = {
	successModalOpen: false,
	saveEntryModalOpen: false
};

//maybe need opening and closing states? could maybe use a
//different action dispatch within the animation?
function modalReducer(state = initialState, action) {
	switch (action.type) {
		case OPEN_SUCCESS_MODAL:
			return {
				...state,
				successModalOpen: true
			};
		case CLOSE_SUCCESS_MODAL:
			return {
				...state,
				successModalOpen: false
			};
		case OPEN_SAVE_ENTRY_MODAL:
			return {
				...state,
				saveEntryModalOpen: true
			};
		case CLOSE_SAVE_ENTRY_MODAL:
			return {
				...state,
				saveEntryModalOpen: false
			};
		default:
			return state;
	}
}

export default modalReducer;
