
import { combineReducers } from "redux";
import authReducer from "./authReducer";
import wordCountReducer from "./wordCountReducer";
import entriesReducer from './entriesReducer'
import modalReducer from './modalReducer'

import alert from './alert';




export default combineReducers({
  auth: authReducer,
  wordCount:wordCountReducer,
  alert,
  entries:entriesReducer,
  modals:modalReducer

});