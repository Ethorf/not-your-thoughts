
import { ADD_ARTICLE } from "../constants/action-types";


const initialState = {
    articles:[]
  };

  function addArticleReducer(state = initialState, action) {

    switch(action.type) {
        case ADD_ARTICLE:
            return Object.assign({}, state, {
                articles: state.articles.concat(action.payload)
              });
        default:
            return state;
    }
}


export default addArticleReducer