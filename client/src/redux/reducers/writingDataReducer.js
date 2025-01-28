import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'
import { ENTRY_TYPES } from '@constants/entryTypes'

import { showToast } from '@utils/toast'

const { NODE, JOURNAL } = ENTRY_TYPES

const initialState = {
  stats: {
    allEntriesTotalWritingTime: 0,
    allEntriesWritingTimeToday: 0,
    allEntriesTotalWordCount: 0,
    allEntriesWordCountToday: 0,
    totalNodesWritingTime: 0,
    nodesWritingTimeToday: 0,
    totalNodeEntriesWordCount: 0,
    nodeEntriesWordCountToday: 0,
    totalJournalEntriesWritingTime: 0,
    journalEntriesWritingTimeToday: 0,
  },
  timeElapsed: 0,
  wordsAdded: 0,
}

export const createWritingData = createAsyncThunk(
  'writingDataReducer/createWritingData',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const { timeElapsed, wordsAdded } = getState().writingData
      const { entryId } = getState().currentEntry

      const response = await axiosInstance.post('api/writing_data/create_writing_data', {
        entry_id: entryId,
        entry_type: NODE,
        duration: timeElapsed,
        word_count: wordsAdded,
      })

      console.log('writing data cree rated')
      return response.data
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
      state.timeElapsed = action.payload
    },
    setWordsAdded: (state, action) => {
      state.wordsAdded = action.payload
    },
    resetWritingDataState: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAllWritingData.fulfilled, (state, action) => {
      state.stats = action.payload
    })
  },
})

export const { setTimeElapsed, setWordsAdded } = writingDataSlice.actions

export default writingDataSlice.reducer
