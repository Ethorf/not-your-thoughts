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
  akas: [],
  // TODO do we really need this? May be useful but not sure it is RN
  // HMMM maybe we integrate this with the autosave timer?
  type: JOURNAL,
  content: '',
  // Note this will hold only title and ID of node entries, I'm currently doing this to not overburden the backend
  //  and compromise performance but think this may be able to be improved
  nodeEntriesInfo: [],
}

export const addAka = createAsyncThunk(
  'akas/addAka',
  async ({ entryId, aka }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { akas } = getState().currentEntry
      const akaValues = akas.map((aka) => aka.aka_value)

      const akaExists = akaValues.some((existingAka) => existingAka.toLowerCase() === aka.toLowerCase())

      if (akaExists) {
        dispatch(showToast('Duplicate, AKA not added', 'error'))

        return rejectWithValue({ message: 'Aka already exists' })
      }

      const response = await axios.post(`api/akas/${entryId}/add_aka`, { aka })
      dispatch(showToast('AKA added', 'success'))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deleteAka = createAsyncThunk(
  'akas/deleteAka',
  async ({ entryId, akaId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.delete(`api/akas/${entryId}/akas/${akaId}`)
      dispatch(showToast('AKA Deleted', 'success'))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createNodeEntry = createAsyncThunk(
  'currentEntryReducer/createNodeEntry',
  async ({ user_id, content, title }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('api/entries/create_node_entry', {
        user_id,
        content,
        title,
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
  async ({ user_id, entryId, content, title, saveType }, { getState, rejectWithValue, dispatch }) => {
    const { AUTO, MANUAL } = SAVE_TYPES

    try {
      const fetchResponse = await dispatch(fetchEntryById(entryId))
      const fetchedEntry = fetchResponse.payload
      const currentState = getState().currentEntry

      // Compare content with the fetched entry
      const titleChanged = fetchedEntry.title !== currentState.title
      const contentChanged = fetchedEntry.content[0] !== currentState.content

      // If no change in content, return the current state
      if (!titleChanged && !contentChanged) {
        if (saveType === MANUAL) dispatch(showToast('Nothing to update', 'warn'))

        console.log('No change to content. No update required.')
        return currentState
      }
      // Content or title has changed, proceed with update
      const response = await axios.post('api/entries/update_node_entry', {
        user_id,
        entryId,
        content,
        title,
      })

      if (saveType === AUTO) {
        dispatch(showToast('Node autosaved', 'warn'))
      } else {
        dispatch(showToast('Node updated', 'success'))
      }
      console.log('Updated with new content')
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
      const { content, connections, date, id: entryId, num_of_words: wordCount, title } = response.data

      return { content: content[0], connections, date, entryId, wordCount, title }
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

const currentEntrySlice = createSlice({
  name: 'currentEntryReducer',
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
    setWPM(state, action) {
      state.wpm = action.payload
    },
    resetCurrentEntryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAkas.fulfilled, (state, action) => {
        state.akas = action.payload
      })
      .addCase(addAka.fulfilled, (state, action) => {
        state.akas = [...state.akas, action.payload.aka]
      })
      .addCase(deleteAka.fulfilled, (state, action) => {
        state.akas = action.payload.akas
      })
      .addCase(createNodeEntry.fulfilled, (state, action) => {
        return {
          ...state,
          entryId: action.payload.id,
          entriesLoading: false,
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
        }
      })
      .addCase(updateNodeEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(fetchEntryById.pending, (state) => {
        return {
          ...state,
          entriesLoading: true,
        }
      })
      .addCase(fetchEntryById.fulfilled, (state) => {
        return {
          ...state,
          entriesLoading: false,
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
  setConnections,
  setTypeNode,
  setTypeJournal,
  setContent,
  setWPM,
} = currentEntrySlice.actions

export default currentEntrySlice.reducer
