import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'
import { ENTRY_TYPES } from '@constants/entryTypes'

import { showToast } from '@utils/toast'
import { normalizeWritingStats, toNonNegativeInt } from '@utils/writingStatsHelpers'

const initialState = {
  stats: normalizeWritingStats(),
  timeElapsed: 0,
  wordsAdded: 0,
  sessionActive: false,
}

export const createWritingData = createAsyncThunk(
  'writingDataReducer/createWritingData',
  async ({ entryType = ENTRY_TYPES.NODE }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { timeElapsed, wordsAdded } = getState().writingData
      const { entryId } = getState().currentEntry

      const safeWordCount = Math.max(0, wordsAdded)
      const safeDuration = Math.max(0, timeElapsed)

      const response = await axiosInstance.post('api/writing_data/create_writing_data', {
        entry_id: entryId,
        entry_type: entryType,
        duration: safeDuration,
        word_count: safeWordCount,
      })

      console.log('writing data created')
      return {
        entry_type: entryType,
        word_count: safeWordCount,
        duration: safeDuration,
      }
    } catch (error) {
      dispatch(showToast('Error saving writing data', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchAllWritingData = createAsyncThunk(
  'writingDataReducer/fetchAllWritingData',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.get('api/writing_data/all_writing_data')

      return response.data
    } catch (error) {
      dispatch(showToast('Error fetching writing data', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

const writingDataSlice = createSlice({
  name: 'writingDataReducer',
  initialState,
  reducers: {
    setTimeElapsed: (state, action) => {
      state.timeElapsed = toNonNegativeInt(action.payload)
    },
    setWordsAdded: (state, action) => {
      state.wordsAdded = toNonNegativeInt(action.payload)
    },
    setSessionActive: (state, action) => {
      state.sessionActive = Boolean(action.payload)
    },
    resetWritingDataState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllWritingData.fulfilled, (state, action) => {
        state.stats = normalizeWritingStats(action.payload)
      })
      .addCase(createWritingData.fulfilled, (state, action) => {
        const { entry_type: entryType, word_count: wordCount, duration } = action.payload
        const safeWordCount = toNonNegativeInt(wordCount)
        const safeDuration = toNonNegativeInt(duration)

        state.stats.allEntriesWordCountToday += safeWordCount
        state.stats.allEntriesWritingTimeToday += safeDuration

        if (entryType === ENTRY_TYPES.NODE) {
          state.stats.nodesWordCountToday += safeWordCount
          state.stats.nodesWritingTimeToday += safeDuration
        } else if (entryType === ENTRY_TYPES.JOURNAL) {
          state.stats.journalWordCountToday += safeWordCount
          state.stats.journalWritingTimeToday += safeDuration
        }

        state.wordsAdded = 0
        state.timeElapsed = 0
        state.sessionActive = false
      })
  },
})

export const { setTimeElapsed, setWordsAdded, setSessionActive } = writingDataSlice.actions

export default writingDataSlice.reducer
