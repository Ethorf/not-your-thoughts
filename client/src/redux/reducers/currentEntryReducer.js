import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { ENTRY_TYPES } from '../../constants/entryTypes'

const { NODE, JOURNAL } = ENTRY_TYPES

// Define initial state
const initialState = {
  entryId: null,
  wordCount: 0,
  charCount: 0,
  title: '',
  category: '',
  connections: [],
  tags: [],
  type: JOURNAL,
  content: '',
  currentVersion: 1,
}

// Thunk for creating a node entry
export const createNodeEntry = createAsyncThunk(
  'currentEntryReducer/createNodeEntry',
  async ({ user_id, content, category, title, tags }, { rejectWithValue }) => {
    console.log('createNodeEntry hit')
    try {
      const response = await axios.post('api/entries/create_node_entry', { user_id, content, category, title, tags })
      console.log(response.data)
      return response.data.newEntry.rows[0].id
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Thunk for updating a node entry
export const updateNodeEntry = createAsyncThunk(
  'currentEntryReducer/updateNodeEntry',
  async ({ user_id, entryId, content, category, title, tags }, { rejectWithValue }) => {
    try {
      const response = await axios.post('api/entries/update_node_entry', {
        user_id,
        entryId,
        content,
        category,
        title,
        tags,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Define a slice
const currentEntrySlice = createSlice({
  name: 'currentEntryReducer', // Name of your reducer slice
  initialState,
  reducers: {
    setWordCount: (state, action) => {
      state.wordCount = action.payload
    },
    setEntryId: (state, action) => {
      state.entryId = action.payload
    },
    setCharCount: (state, action) => {
      state.charCount = action.payload
    },
    setTitle: (state, action) => {
      state.title = action.payload
    },
    setCategory: (state, action) => {
      state.category = action.payload
    },
    setTags: (state, action) => {
      state.tags.push(action.payload)
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
  },
  extraReducers: (builder) => {
    // Handle createNodeEntry fulfilled action
    builder.addCase(createNodeEntry.fulfilled, (state, action) => {
      return {
        ...state,
        entryId: action.payload,
      }
    })
    // Handle updateNodeEntry fulfilled action
    builder.addCase(updateNodeEntry.fulfilled, (state, action) => {
      return {
        ...state,
        ...action.payload,
      }
    })
  },
})

// Export reducer actions
export const {
  setEntryId,
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
