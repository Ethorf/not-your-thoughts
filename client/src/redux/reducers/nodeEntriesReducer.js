import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'

const initialState = {
  allNodeEntries: [],
  nodeEntriesLoading: false,
}

export const fetchNodeEntries = createAsyncThunk(
  'nodeEntriesReducer/fetchNodeEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/entries/node_entries')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const nodeEntriesSlice = createSlice({
  name: 'nodeEntriesReducer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNodeEntries.fulfilled, (state, action) => {
        state.allNodeEntries = action.payload.entries
        state.nodeEntriesLoading = false
      })
      .addCase(fetchNodeEntries.pending, (state) => {
        state.nodeEntriesLoading = true
      })
      .addCase(fetchNodeEntries.rejected, (state) => {
        state.nodeEntriesLoading = false
      })
  },
})

export default nodeEntriesSlice.reducer
