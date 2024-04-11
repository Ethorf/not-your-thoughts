import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { ENTRY_TYPES } from '../../constants/entryTypes'
import { showToast } from '../../utils/toast'

const { NODE, JOURNAL } = ENTRY_TYPES

const initialState = {
  entryId: null,
  wordCount: 0,
  timeElapsed: 0,
  wpm: 0,
  title: '',
  category: '',
  allCategories: [],
  connections: [],
  tags: [],
  tagInput: '',
  // TODO do we really need this? May be useful but not sure it is RN
  type: JOURNAL,
  content: '',
}

export const createNodeEntry = createAsyncThunk(
  'currentEntryReducer/createNodeEntry',
  async ({ user_id, content, category, title, tags }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('api/entries/create_node_entry', {
        user_id,
        content,
        category,
        title,
        tags,
      })
      dispatch(showToast('Node Created', 'success'))
      return response.data.newEntry.rows[0]
    } catch (error) {
      dispatch(showToast('Node creation error', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const saveJournalEntry = createAsyncThunk(
  'currentEntryReducer/saveJournalEntry',
  async ({ entryId, user_id, content, timeElapsed, wpm, wordCount }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('api/entries/save_journal_entry', {
        user_id,
        content,
        num_of_words: wordCount,
        entryId,
        total_time_taken: timeElapsed,
        wpm,
      })

      dispatch(showToast('Journal Entry Saved', 'success'))

      return response.data.entry_id
    } catch (error) {
      dispatch(showToast('Error saving journal entry', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateNodeEntry = createAsyncThunk(
  'currentEntryReducer/updateNodeEntry',
  async ({ user_id, entryId, content, category, title, tags }, { getState, rejectWithValue, dispatch }) => {
    try {
      const fetchResponse = await dispatch(fetchEntryById(entryId))
      const fetchedEntry = fetchResponse.payload
      const currentState = getState().currentEntry

      // Compare content, category, and tags with the fetched entry
      const titleChanged = fetchedEntry.title !== currentState.title
      const contentChanged = fetchedEntry.content[0] !== currentState.content
      const categoryChanged = fetchedEntry.category_name !== currentState.category
      const tagsChanged = JSON.stringify(fetchedEntry.tag_names) !== JSON.stringify(tags)

      // If no change in content, category, and tags, return the current state
      if (!titleChanged && !contentChanged && !categoryChanged && !tagsChanged) {
        dispatch(showToast('Nothing to update', 'warn'))
        console.log('No change to content, category, and tags. No update required.')
        return currentState
      }
      // Content, category, or tags have changed, proceed with update
      const response = await axios.post('api/entries/update_node_entry', {
        user_id,
        entryId,
        content,
        category,
        title,
        tags,
      })
      dispatch(showToast('Node updated', 'success'))

      console.log('Updated with new content, category, or tags')
      return response.data
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

export const setEntryById = createAsyncThunk(
  'currentEntryReducer/setEntryById',
  async (queryParamEntryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`api/entries/entry/${queryParamEntryId}`)
      const {
        content,
        category_name: category,
        connections,
        date,
        id: entryId,
        num_of_words: wordCount,
        tag_names: tags,
        title,
      } = response.data

      return { content: content[0], category, connections, date, entryId, wordCount, tags, title }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchCategories = createAsyncThunk(
  'currentEntryReducer/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('api/entries/categories')
      return response.data.categories // Assuming the API response contains an array of category names
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchTags = createAsyncThunk('currentEntryReducer/fetchTags', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('api/entries/tags')
    return response.data.tags
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

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
    setTimeElapsed(state, action) {
      state.timeElapsed = action.payload
    },
    setCategory: (state, action) => {
      state.category = action.payload
    },
    setTags: (state, action) => {
      state.tags.push(action.payload)
    },
    setTagInput: (state, action) => {
      state.tagInput = action.payload
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
    setWPM(state, action) {
      state.wpm = action.payload
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.allCategories = action.payload
    })
    builder.addCase(createNodeEntry.fulfilled, (state, action) => {
      return {
        ...state,
        entryId: action.payload.id,
        category: action.payload.category_name,
      }
    })
    builder.addCase(saveJournalEntry.fulfilled, (state, action) => {
      return {
        ...state,
        entryId: action.payload,
      }
    })
    builder.addCase(updateNodeEntry.fulfilled, (state, action) => {
      return {
        ...state,
        category: action.payload.category_name,
      }
    })
    builder.addCase(fetchEntryById.fulfilled, (state, action) => {
      return {
        ...state,
        entryId: action.payload.id,
        tags: action.payload.tag_names,
      }
    })
    builder.addCase(setEntryById.fulfilled, (state, action) => {
      return {
        ...state,
        ...action.payload,
      }
    })
  },
})

export const {
  resetState,
  setEntryId,
  setWordCount,
  setCharCount,
  setTitle,
  setTimeElapsed,
  setCategory,
  setConnections,
  setTags,
  setTagInput,
  setTypeNode,
  setTypeJournal,
  setContent,
  setVersion,
  setWPM,
} = currentEntrySlice.actions

export default currentEntrySlice.reducer
