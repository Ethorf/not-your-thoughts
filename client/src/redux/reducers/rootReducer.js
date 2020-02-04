
import { ADD_ARTICLE, CHANGE_WORDCOUNT } from "../constants/action-types";
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import wordCountReducer from "./wordCountReducer";
import addArticleReducer from "./addArticleReducer";


// THIS IS THE ROOT REDUCER FUCK I GOTTA DO SOME BETTA RELABELLING THERE


////// gdefinitely going to need to redo this as well as the index.js in store

// const initialState = {
//     wordCount:0,
//     articles:[]
//   };


//but this is just using the combineReducers function
//, it is imported as rootReducer in the store

export default combineReducers({
  auth: authReducer,
  errors: errorReducer,
  wordCount:wordCountReducer,
  addArticle:addArticleReducer
});


//   function rootReducer(state = initialState, action) {

//     switch(action.type) {
//         case ADD_ARTICLE:
//             return Object.assign({}, state, {
//                 articles: state.articles.concat(action.payload)
//               });
//         case CHANGE_WORDCOUNT:
//             return Object.assign({}, state, {
//                 wordCount: action.payload
//               });
//         default:
//             return state;
//     }
    
//     return state;
// }


// export default rootReducer