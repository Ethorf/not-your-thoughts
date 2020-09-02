import {
	OPEN_SUCCESS_MODAL,
	CLOSE_SUCCESS_MODAL,
	OPEN_SAVE_ENTRY_MODAL,
	CLOSE_SAVE_ENTRY_MODAL,
	OPEN_INTRO_MODAL,
	CLOSE_INTRO_MODAL,
	TOGGLE_GUEST_MODE_MODAL_SEEN
} from './actionTypes';

export const openSuccessModal = () => (dispatch) => {
	dispatch({
		type: OPEN_SUCCESS_MODAL
	});
};

export const closeSuccessModal = () => (dispatch) => {
	dispatch({
		type: CLOSE_SUCCESS_MODAL
	});
};
export const toggleGuestModeModalSeen = () => (dispatch) => {
	dispatch({
		type: TOGGLE_GUEST_MODE_MODAL_SEEN
	});
};

export const openSaveEntryModal = () => (dispatch) => {
	dispatch({
		type: OPEN_SAVE_ENTRY_MODAL
	});
};

export const closeSaveEntryModal = () => (dispatch) => {
	dispatch({
		type: CLOSE_SAVE_ENTRY_MODAL
	});
};

export const openIntroModal = () => (dispatch) => {
	dispatch({
		type: OPEN_INTRO_MODAL
	});
};

export const closeIntroModal = () => (dispatch) => {
	dispatch({
		type: CLOSE_INTRO_MODAL
	});
};
