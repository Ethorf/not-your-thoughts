import { combineReducers } from 'redux'

import alert from './alert'
import authReducer from './authReducer'
import categoriesReducer from './categoriesReducer'
import connectionsReducer from './connectionsReducer'
import currentEntryReducer from './currentEntryReducer'
import customPromptsReducer from './customPromptsReducer'
import journalEntriesReducer from './journalEntriesReducer'
import modalsReducer from './modalsReducer'
import modesReducer from './modesReducer'
import nodeEntriesReducer from './nodeEntriesReducer'
import sidebarReducer from './sidebarReducer'
import wordCountReducer from './wordCountReducer'

export default combineReducers({
  alert,
  auth: authReducer,
  categories: categoriesReducer,
  connections: connectionsReducer,
  currentEntry: currentEntryReducer,
  customPrompts: customPromptsReducer,
  journalEntries: journalEntriesReducer,
  modals: modalsReducer,
  modes: modesReducer,
  nodeEntries: nodeEntriesReducer,
  sidebar: sidebarReducer,
  wordCount: wordCountReducer,
})
