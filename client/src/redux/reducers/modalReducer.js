import {
	OPEN_SUCCESS_MODAL,
	CLOSE_SUCCESS_MODAL,
	OPEN_INTRO_MODAL,
	CLOSE_INTRO_MODAL,
	CLOSE_SAVE_ENTRY_MODAL,
	OPEN_SAVE_ENTRY_MODAL,
	TOGGLE_GUEST_MODE_MODAL_SEEN
} from '../actions/actionTypes';

const initialState = {
	successModalOpen: false,
	saveEntryModalOpen: false,
	introModalOpen: false,
	guestModeModalSeen: false
};

function modalReducer(state = initialState, action) {
	switch (action.type) {
		case OPEN_SUCCESS_MODAL:
			return {
				...state,
				successModalOpen: true
			};
		case TOGGLE_GUEST_MODE_MODAL_SEEN:
			return {
				...state,
				guestModeModalSeen: !state.guestModeModalSeen
			};
		case CLOSE_SUCCESS_MODAL:
			return {
				...state,
				successModalOpen: false
			};
		case OPEN_INTRO_MODAL:
			return {
				...state,
				introModalOpen: true
			};
		case CLOSE_INTRO_MODAL:
			return {
				...state,
				introModalOpen: false
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
