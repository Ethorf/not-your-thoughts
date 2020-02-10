import { OPEN_SUCCESS_MODAL,CLOSE_SUCCESS_MODAL } from "../actions/action-types";

  const initialState = {
    successModalOpen:false
  };

  //maybe need opening and closing states? could maybe use a
  //different action dispatch within the animation?
  function modalReducer(state = initialState, action) {

    switch(action.type) {
        case OPEN_SUCCESS_MODAL:
            return {
            ...state,
            successModalOpen:true
            };
        case CLOSE_SUCCESS_MODAL:
        return {
            ...state,
            successModalOpen:false
        }
        default:
            return state;
    }
}


export default modalReducer