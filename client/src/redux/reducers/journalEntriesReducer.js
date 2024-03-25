import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = {
  journalConfig: null,
  entries: [],
  entry: '',
  timeElapsed: '',
  loading: true,
  timerActive: false,
}

export const fetchJournalEntries = createAsyncThunk('journalEntriesReducer/fetchJournalEntries', async () => {
  try {
    const response = await fetch('/api/entries/journal_entries')
    const data = await response.json()
    return data.entries
  } catch (error) {
    throw Error('Failed to fetch journal entries')
  }
})

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
    deleteEntry(state, action) {
      state.loading = true
      state.entries = state.entries.filter((entry) => entry.id !== action.payload)
    },
    setEntry(state, action) {
      state.entry = action.payload
    },
    setTimeElapsed(state, action) {
      state.timeElapsed = action.payload
    },
    toggleTimerActive(state, action) {
      state.timerActive = action.payload
    },
    entriesError(state, action) {
      // Handle error if needed
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
        // Handle error if needed
      })
  },
})

export const {
  setJournalConfig,
  updateJournalConfig,
  saveEntry,
  deleteEntry,
  setEntry,
  setTimeElapsed,
  toggleTimerActive,
  entriesError,
} = journalEntriesSlice.actions

export default journalEntriesSlice.reducer
