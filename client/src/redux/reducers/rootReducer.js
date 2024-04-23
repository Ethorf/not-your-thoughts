import { combineReducers } from 'redux'
import authReducer from './authReducer'
import wordCountReducer from './wordCountReducer'
import modalsReducer from './modalsReducer'
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
  modals: modalsReducer,
  modes: modesReducer,
  currentEntry: currentEntryReducer,
  nodeEntries: nodeEntriesReducer,
  journalEntries: journalEntriesReducer,
  customPrompts: customPromptsReducer,
})
