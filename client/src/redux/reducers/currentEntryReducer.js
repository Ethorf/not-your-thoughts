import { createSlice } from '@reduxjs/toolkit'
import { ENTRY_TYPES } from '../../constants/entryTypes.js'

const { NODE, JOURNAL } = ENTRY_TYPES
// Define initial state
const initialState = {
  id: null,
  wordCount: 0,
  charCount: 0,
  title: '',
  categories: [],
  connections: [],
  type: JOURNAL,
  content: '',
  currentVersion: 1,
}

// Define a slice
const currentEntrySlice = createSlice({
  name: 'currentEntryReducer', // Name of your reducer slice
  initialState,
  reducers: {
    setWordCount: (state, action) => {
      state.wordCount = action.payload
    },
    setCharCount: (state, action) => {
      state.charCount = action.payload
    },
    setTitle: (state, action) => {
      state.title = action.payload
    },
    setCategories: (state, action) => {
      state.categories = action.payload
    },
    setConnections: (state, action) => {
      state.connections = action.payload
    },
    setTypeNode: (state) => {
      state.type = NODE
    },
    setTypeJournal: (state) => {
      state.type = JOURNAL
    },
    setContent: (state, action) => {
      state.content = action.payload
    },
    setVersion: (state, action) => {
      state.currentVersion = action.payload
    },
    // More reducer actions...
  },
})

// Export reducer actions
export const {
  setId,
  setWordCount,
  setCharCount,
  setTitle,
  setCategories,
  setConnections,
  setTypeNode,
  setTypeJournal,
  setContent,
  setVersion,
} = currentEntrySlice.actions

// Export reducer function
export default currentEntrySlice.reducer
