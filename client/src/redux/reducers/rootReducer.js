import { combineReducers } from 'redux'
import authReducer from './authReducer'
import wordCountReducer from './wordCountReducer'
import entriesReducer from './journalEntriesReducer'
import modalReducer from './modalReducer'
import modesReducer from './modesReducer'

import alert from './alert'

export default combineReducers({
  auth: authReducer,
  wordCount: wordCountReducer,
  alert,
  entries: entriesReducer,
  modals: modalReducer,
  modes: modesReducer,
})
