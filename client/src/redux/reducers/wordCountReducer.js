import { CHANGE_WORDCOUNT } from "../constants/action-types";

  const initialState = {
    wordCount:0
  };

  
  function wordCountReducer(state = initialState, action) {

    switch(action.type) {
        case CHANGE_WORDCOUNT:
            return Object.assign({}, state, {
                wordCount: action.payload
              });
        default:
            return state;
    }
    
    return state;
}


export default wordCountReducer