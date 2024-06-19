import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { CONNECTION_TYPES } from '@constants/connectionTypes'
const initialState = {
  connections: [],
  loading: false,
  error: null,
}

// Async thunk to create a connection
export const createConnection = createAsyncThunk(
  'connections/create_connection',
  async ({ type, primary_entry_id, foreign_entry_id, source }, { rejectWithValue }) => {
    try {
      const response = await axios.post('api/connections/create_connection', {
        type,
        primary_entry_id,
        foreign_entry_id,
        source,
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Async thunk to create a connection
export const createHorizontalConnection = createAsyncThunk(
  'connectionsReducer/createHorizontalConnection',
  async ({ primary_entry_id, foreign_entry_id, source }, { rejectWithValue }) => {
    try {
      const response = await axios.post('api/connections/create_connection', {
        type: CONNECTION_TYPES.HORIZONTAL,
        primary_entry_id,
        foreign_entry_id,
        source,
      })
      console.log('<<<<<< response >>>>>>>>> is: <<<<<<<<<<<<')
      console.log(response)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Async thunk to delete a connection
export const deleteConnection = createAsyncThunk(
  'connections/delete_connection',
  async (connectionId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`api/connections/delete_connection/${connectionId}`)
      return { connectionId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

// Async thunk to fetch all connections based on entry_id
export const fetchConnections = createAsyncThunk(
  'connections/fetchConnections',
  async (entry_id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`api/connections/${entry_id}`)
      return response.data.connections
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const connectionsSlice = createSlice({
  name: 'connections',
  initialState,
  reducers: {
    resetConnections: (state) => {
      state.connections = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConnection.pending, (state) => {
        state.loading = true
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        state.loading = false
        state.connections.push(action.payload)
      })
      .addCase(createConnection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createHorizontalConnection.fulfilled, (state, action) => {
        return {
          ...state,
          connections: action.payload.connections,
          loading: false,
        }
      })
      .addCase(createHorizontalConnection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(deleteConnection.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.loading = false
        state.connections = state.connections.filter((connection) => connection.id !== action.payload.connectionId)
      })
      .addCase(deleteConnection.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        return {
          ...state,
          connections: action.payload,
          loading: false,
        }
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetConnections } = connectionsSlice.actions

export default connectionsSlice.reducer
