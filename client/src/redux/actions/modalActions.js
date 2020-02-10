
import {
OPEN_SUCCESS_MODAL,CLOSE_SUCCESS_MODAL
  } from './action-types';

  
// Open Success Modal
export const openSuccessModal = () => dispatch => {

    dispatch({
        type: OPEN_SUCCESS_MODAL
      });
  };

  // Close Success Modal
export const closeSuccessModal = () => dispatch => {

    dispatch({
        type: CLOSE_SUCCESS_MODAL
      });
};

  //Save Entry

