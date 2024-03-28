import { combineReducers } from 'redux'
import authReducer from './authReducer'
import wordCountReducer from './wordCountReducer'
import modalReducer from './modalReducer'
import modesReducer from './modesReducer'
import currentEntryReducer from './currentEntryReducer'
import nodeEntriesReducer from './nodeEntriesReducer'
import journalEntriesReducer from './journalEntriesReducer'
import customPromptsReducer from './customPromptsReducer'

import alert from './alert'

export default combineReducers({
  auth: authReducer,
  wordCount: wordCountReducer,
  alert,
  modals: modalReducer,
  modes: modesReducer,
  currentEntry: currentEntryReducer,
  nodeEntries: nodeEntriesReducer,
  journalEntries: journalEntriesReducer,
  customPrompts: customPromptsReducer,
})
