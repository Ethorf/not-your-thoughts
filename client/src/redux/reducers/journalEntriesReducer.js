import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  journalConfig: null,
  entries: [],
  entry: '',
  loading: true,
  timerActive: false,
}

// Async thunk to fetch journal configuration
export const fetchJournalConfig = createAsyncThunk('journal/fetchJournalConfig', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get('/api/journal_config')
    return response.data.journalConfig
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const fetchJournalEntries = createAsyncThunk(
  'journalEntriesReducer/fetchJournalEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/entries/journal_entries')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const journalEntriesSlice = createSlice({
  name: 'journalEntriesReducer',
  initialState,
  reducers: {
    setJournalConfig(state, action) {
      state.journalConfig = action.payload
      state.loading = false
    },
    updateJournalConfig(state, action) {
      state.journalConfig = action.payload
      state.loading = false
    },
    saveEntry(state, action) {
      state.entries.unshift(action.payload)
    },
    deleteJournalEntry(state, action) {
      state.loading = true
      state.entries = state.entries.filter((entry) => entry.id !== action.payload)
    },
    setEntry(state, action) {
      state.entry = action.payload
    },
    toggleTimerActive(state, action) {
      state.timerActive = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournalEntries.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.entries = action.payload
        state.loading = false
      })
      .addCase(fetchJournalEntries.rejected, (state) => {
        state.loading = false
      })
      .addCase(fetchJournalConfig.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchJournalConfig.fulfilled, (state, action) => {
        state.journalConfig = action.payload
        state.loading = false
      })
      .addCase(fetchJournalConfig.rejected, (state) => {
        state.loading = false
      })
  },
})

export const {
  setJournalConfig,
  updateJournalConfig,
  saveEntry,
  deleteJournalEntry,
  setEntry,
  toggleTimerActive,
  entriesError,
} = journalEntriesSlice.actions

export default journalEntriesSlice.reducer
