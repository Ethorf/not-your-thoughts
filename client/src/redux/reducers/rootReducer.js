
import { ADD_ARTICLE, CHANGE_WORDCOUNT } from "../actions/action-types";
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import wordCountReducer from "./wordCountReducer";
import alert from './alert';




export default combineReducers({
  auth: authReducer,
  wordCount:wordCountReducer,
  alert

});
