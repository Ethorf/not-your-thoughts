import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'
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
  type: JOURNAL,
  content: '',
  nodeEntriesInfo: [],
  starred: false,
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

      const response = await axiosInstance.post(`api/akas/${entryId}/add_aka`, { aka })
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
      const response = await axiosInstance.delete(`api/akas/${entryId}/akas/${akaId}`)
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
      const response = await axiosInstance.post('api/entries/create_node_entry', {
        user_id,
        content,
        title,
      })

      dispatch(showToast('Node Created', 'success'))
      await dispatch(fetchNodeEntriesInfo())

      return response.data
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
      const response = await axiosInstance.post('api/entries/save_journal_entry', {
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
    const { AUTO, MANUAL, EXTERNAL_CONNECTION } = SAVE_TYPES

    try {
      const fetchResponse = await dispatch(fetchEntryById(entryId))
      const fetchedEntry = fetchResponse.payload
      const currentState = getState().currentEntry

      const titleChanged = fetchedEntry.title !== currentState.title
      const contentChanged = fetchedEntry.content[0] !== currentState.content

      if (!titleChanged && !contentChanged && saveType !== EXTERNAL_CONNECTION) {
        if (saveType === MANUAL) dispatch(showToast('Nothing to update', 'warn'))

        console.log('No change to content. No update required.')
        return currentState
      }

      const response = await axiosInstance.post('api/entries/update_node_entry', {
        user_id,
        entryId,
        content,
        title,
      })

      await dispatch(fetchNodeEntriesInfo())

      if (saveType === AUTO) {
        dispatch(showToast('Node autosaved', 'warn'))
        return ''
      } else {
        dispatch(showToast('Node updated', 'success'))
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
      const response = await axiosInstance.get(`api/entries/entry/${entryId}`)

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchNodeEntriesInfo = createAsyncThunk(
  'currentEntryReducer/fetchNodeEntriesInfo',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.get('api/entries/node_entries_info')
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
      const response = await axiosInstance.get(`api/entries/entry/${queryParamEntryId}`)
      const { content, connections, date, id: entryId, num_of_words: wordCount, starred, title } = response.data

      return { content: content[0], connections, date, entryId, wordCount, starred, title }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchAkas = createAsyncThunk('akas/fetchAkas', async (entryId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`api/akas/${entryId}/akas`)
    return response.data.akas
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const deleteEntry = createAsyncThunk(
  'currentEntryReducer/deleteEntry',
  async (entryId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.delete(`api/entries/delete_entry/${entryId}`)
      dispatch(showToast('Entry Deleted', 'success'))
      return response.data
    } catch (error) {
      dispatch(showToast('Error deleting entry', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const toggleNodeStarred = createAsyncThunk(
  'currentEntryReducer/toggleNodeStarred',
  async ({ entryId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('api/entries/toggle_starred', { entryId })

      await dispatch(fetchNodeEntriesInfo())

      return response.data
    } catch (error) {
      dispatch(showToast('Error updating starred status', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

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
        state.entriesLoading = false
        state.nodeEntriesInfo.push(action.payload)
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
        // Will only receive a payload if not an autosave update
        if (action.payload.content) {
          return {
            ...state,
            entriesLoading: false,
            content: action.payload.content,
          }
        } else {
          return {
            ...state,
            entriesLoading: false,
          }
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
      .addCase(setEntryById.pending, (state, action) => {
        return {
          ...state,
          ...action.payload,
          entriesLoading: true,
        }
      })
      .addCase(setEntryById.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          entriesLoading: false,
        }
      })
      .addCase(fetchNodeEntriesInfo.fulfilled, (state, action) => {
        state.nodeEntriesInfo = action.payload
      })
      .addCase(deleteEntry.fulfilled, (state) => {
        return initialState
      })
      .addCase(toggleNodeStarred.fulfilled, (state, action) => {
        const { entryId, starred } = action.payload
        if (state.entryId === entryId) {
          state.starred = starred
        }
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
