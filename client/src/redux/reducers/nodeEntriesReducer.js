import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  allNodeEntries: [],
}

export const fetchNodeEntries = createAsyncThunk(
  'nodeEntriesReducer/fetchNodeEntries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/entries/node_entries')
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
    builder.addCase(fetchNodeEntries.fulfilled, (state, action) => {
      state.allNodeEntries = action.payload
    })
  },
})

export default nodeEntriesSlice.reducer
