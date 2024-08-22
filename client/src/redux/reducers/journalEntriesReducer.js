import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'

const initialState = {
  journalConfig: null,
  entries: [],
  entry: '',
  journalEntriesLoading: false,
  timerActive: false,
}

// Async thunk to fetch journal configuration
export const fetchJournalConfig = createAsyncThunk('journal/fetchJournalConfig', async (_, { rejectWithValue }) => {
  try {
    console.log('fetching journal config')
    const response = await axiosInstance.get('/api/user_journal_config')
    return response.data.journalConfig
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const fetchJournalEntries = createAsyncThunk(
  'journalEntriesReducer/fetchJournalEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/entries/journal_entries')
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
      state.journalEntriesLoading = false
    },
    updateJournalConfig(state, action) {
      state.journalConfig = action.payload
      state.journalEntriesLoading = false
    },
    saveEntry(state, action) {
      state.entries.unshift(action.payload)
    },
    deleteJournalEntry(state, action) {
      state.journalEntriesLoading = true
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
        state.journalEntriesLoading = true
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.entries = action.payload
        state.journalEntriesLoading = false
      })
      .addCase(fetchJournalEntries.rejected, (state) => {
        state.journalEntriesLoading = false
      })
      .addCase(fetchJournalConfig.pending, (state) => {
        state.journalEntriesLoading = true
      })
      .addCase(fetchJournalConfig.fulfilled, (state, action) => {
        state.journalConfig = action.payload
        state.journalEntriesLoading = false
      })
      .addCase(fetchJournalConfig.rejected, (state) => {
        state.journalEntriesLoading = false
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
