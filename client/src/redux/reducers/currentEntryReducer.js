import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { ENTRY_TYPES } from '../../constants/entryTypes'
import { toast } from 'react-toastify'

export const showToast = (message) => {
  return () => {
    toast(message)
  }
}

const { NODE, JOURNAL } = ENTRY_TYPES

const initialState = {
  entryId: null,
  wordCount: 0,
  charCount: 0,
  title: '',
  category: '',
  allCategories: [],
  connections: [],
  tags: [],
  tagInput: '',
  type: JOURNAL,
  content: '',
}

export const createNodeEntry = createAsyncThunk(
  'currentEntryReducer/createNodeEntry',
  async ({ user_id, content, category, title, tags }, { rejectWithValue, dispatch }) => {
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
      dispatch(showToast('Node Created'))

      return response.data.newEntry.rows[0]
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
      const fetchedEntry = fetchResponse.payload
      const currentState = getState().currentEntry

      // Compare content, category, and tags with the fetched entry
      const contentChanged = fetchedEntry.content[0] !== currentState.content
      const categoryChanged = fetchedEntry.category_name !== currentState.category
      const tagsChanged = JSON.stringify(fetchedEntry.tag_names) !== JSON.stringify(tags)

      // If no change in content, category, and tags, return the current state
      if (!contentChanged && !categoryChanged && !tagsChanged) {
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
      dispatch(showToast('Node updated'))
      console.log('Updated with new content, category, or tags')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// AHH no this we want to basically not set anything, just fetch!
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
  },
  extraReducers: (builder) => {
    // TODO incorporate this into the general saving call etc. for
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
      // Assuming action.payload has the shape of the initialState
      return {
        ...state,
        ...action.payload,
      }
    })
  },
})

export const {
  setEntryId,
  setWordCount,
  setCharCount,
  setTitle,
  setCategory,
  setConnections,
  setTags,
  setTagInput,
  setTypeNode,
  setTypeJournal,
  setContent,
  setVersion,
} = currentEntrySlice.actions

export default currentEntrySlice.reducer
