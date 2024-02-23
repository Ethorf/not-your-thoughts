import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { ENTRY_TYPES } from '../../constants/entryTypes'

const { NODE, JOURNAL } = ENTRY_TYPES

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

export const createNodeEntry = createAsyncThunk(
  'currentEntryReducer/createNodeEntry',
  async ({ user_id, content, category, title, tags }, { rejectWithValue }) => {
    // Convert content to an array if it's not already one
    const contentArray = Array.isArray(content) ? content : [content]

    try {
      const response = await axios.post('api/entries/create_node_entry', {
        user_id,
        content: contentArray,
        category,
        title,
        tags,
      })
      return response.data.newEntry.rows[0].id
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateNodeEntry = createAsyncThunk(
  'currentEntryReducer/updateNodeEntry',
  async ({ user_id, entryId, content, category, title, tags }, { getState, rejectWithValue, dispatch }) => {
    try {
      const fetchResponse = await dispatch(fetchEntryById(entryId))
      const fetchedEntryContent = fetchResponse.payload.content

      const currentState = getState().currentEntry

      // Compare content with the fetched entry
      if (fetchedEntryContent[0] === currentState.content) {
        console.log('no change to content, no update')
        return currentState
      } else {
        // Content is different, proceed with update
        const response = await axios.post('api/entries/update_node_entry', {
          user_id,
          entryId,
          content,
          category,
          title,
          tags,
        })
        console.log('updated with new content')
        return response.data
      }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchEntryById = createAsyncThunk(
  'currentEntryReducer/fetchEntryById',
  async (entryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`api/entries/entry/${entryId}`)

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
    builder.addCase(createNodeEntry.fulfilled, (state, action) => {
      return {
        ...state,
        entryId: action.payload,
      }
    })
    builder.addCase(updateNodeEntry.fulfilled, (state, action) => {
      return {
        ...state,
      }
    })
    builder.addCase(fetchEntryById.fulfilled, (state, action) => {
      return {
        ...state,
        entryId: action.payload.id,
      }
    })
  },
})

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

export default currentEntrySlice.reducer
