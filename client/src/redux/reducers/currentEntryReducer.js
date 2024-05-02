import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { ENTRY_TYPES } from '@constants/entryTypes'
import { SAVE_TYPES } from '@constants/saveTypes'

import { showToast } from '@utils/toast'

const { NODE, JOURNAL } = ENTRY_TYPES

const initialState = {
  entryId: null,
  entriesLoading: false,
  wordCount: 0,
  timeElapsed: 0,
  wpm: 0,
  title: '',
  category: '',
  allCategories: [],
  connections: [],
  tags: [],
  tagInput: '',
  akas: [],
  // TODO do we really need this? May be useful but not sure it is RN
  // HMMM maybe we integrate this with the autosave timer?
  type: JOURNAL,
  content: '',
  // Note this will hold only title and ID of node entries, I'm currently doing this to not overburden the backend
  //  and compromise performance but think this may be able to be improved
  nodeEntriesInfo: [],
}

export const addAka = createAsyncThunk('akas/addAka', async ({ entryId, aka }, { rejectWithValue }) => {
  try {
    const response = await axios.post(`api/akas/${entryId}/add_aka`, { aka })
    return response.data // Assuming the API response contains the newly added aka
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

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
  async ({ user_id, entryId, content, category, title, tags, saveType }, { getState, rejectWithValue, dispatch }) => {
    const { AUTO, MANUAL } = SAVE_TYPES

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
        if (saveType === MANUAL) dispatch(showToast('Nothing to update', 'warn'))

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

      if (saveType === AUTO) {
        dispatch(showToast('Node autosaved', 'warn'))
      } else {
        dispatch(showToast('Node updated', 'success'))
      }
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

// Define async thunk to fetch node entries' information
export const fetchNodeEntriesInfo = createAsyncThunk(
  'currentEntryReducer/fetchNodeEntriesInfo',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.get('api/entries/node_entries_info')
      return response.data.nodeEntries
    } catch (error) {
      dispatch(showToast('Error fetching node entries', 'error'))
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

export const fetchAkas = createAsyncThunk('akas/fetchAkas', async (entryId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`api/akas/${entryId}/akas`)
    return response.data.akas
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const fetchCategories = createAsyncThunk(
  'currentEntryReducer/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('api/entries/categories')
      return response.data.categories
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

const currentEntrySlice = createSlice({
  name: 'currentEntryReducer', // Name of your reducer slice
  initialState,
  reducers: {
    setAkas: (state, action) => {
      state.akas = action.payload
    },
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
    setTitleAndResetAll: (state, action) => {
      Object.assign(state, { ...initialState, title: action.payload })
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
    resetCurrentEntryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.allCategories = action.payload
      })
      .addCase(fetchAkas.fulfilled, (state, action) => {
        state.akas = action.payload
      })
      .addCase(addAka.fulfilled, (state, action) => {
        state.akas = [...state.akas, action.payload.aka]
      })
      .addCase(createNodeEntry.fulfilled, (state, action) => {
        return {
          ...state,
          entryId: action.payload.id,
          entriesLoading: false,
          category: action.payload.category_name,
        }
      })
      .addCase(createNodeEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(saveJournalEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(saveJournalEntry.fulfilled, (state, action) => {
        return {
          ...state,
          entriesLoading: false,
          entryId: action.payload,
        }
      })
      .addCase(updateNodeEntry.fulfilled, (state, action) => {
        return {
          ...state,
          entriesLoading: false,
          category: action.payload.category_name,
        }
      })
      .addCase(updateNodeEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(fetchEntryById.fulfilled, (state, action) => {
        return {
          ...state,
          entryId: action.payload.id,
          tags: action.payload.tag_names,
        }
      })
      .addCase(setEntryById.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
        }
      })
      .addCase(fetchNodeEntriesInfo.fulfilled, (state, action) => {
        state.nodeEntriesInfo = action.payload
      })
  },
})

export const {
  resetCurrentEntryState,
  setAkas,
  setEntryId,
  setWordCount,
  setCharCount,
  setTitle,
  setTitleAndResetAll,
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
