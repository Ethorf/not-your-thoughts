import { OPEN_SUCCESS_MODAL, CLOSE_SUCCESS_MODAL, OPEN_SAVE_ENTRY_MODAL, CLOSE_SAVE_ENTRY_MODAL } from './actionTypes';

// Open Success Modal
export const openSuccessModal = () => (dispatch) => {
	dispatch({
		type: OPEN_SUCCESS_MODAL
	});
};

// Close Success Modal
export const closeSuccessModal = () => (dispatch) => {
	dispatch({
		type: CLOSE_SUCCESS_MODAL
	});
};

//Save Entry
export const openSaveEntryModal = () => (dispatch) => {
	dispatch({
		type: OPEN_SAVE_ENTRY_MODAL
	});
};

// Close SAVE_ENTRY Modal
export const closeSaveEntryModal = () => (dispatch) => {
	dispatch({
		type: CLOSE_SAVE_ENTRY_MODAL
	});
};
