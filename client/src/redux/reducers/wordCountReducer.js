import { CHANGE_WORDCOUNT,GOAL_REACHED } from "../actions/action-types";

  const initialState = {
    wordCount:0,
    goalReachedStatus:false
  };

  
  function wordCountReducer(state = initialState, action) {

    switch(action.type) {
        case CHANGE_WORDCOUNT:
            return Object.assign({}, state, {
                wordCount: action.payload
              });
        case GOAL_REACHED:
             return {
            ...state,
            goalReachedStatus:true
            };
        default:
            return state;
    }
}


export default wordCountReducer