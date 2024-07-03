import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

import { showToast } from '@utils/toast'

const initialState = {
  connections: [],
  connectionsLoading: false,
  connectionTitleInput: '',
  error: null,
  selectedPrimarySourceText: '',
  selectedForeignSourceText: '',
}

// Async thunk to create a connection
export const createConnection = createAsyncThunk(
  'connections/create_connection',
  async (
    { connection_type, primary_entry_id, foreign_entry_id, primary_source, foreign_source, source_type },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axios.post('api/connections/create_connection', {
        connection_type,
        primary_entry_id,
        foreign_entry_id,
        primary_source,
        foreign_source,
        source_type,
      })

      dispatch(showToast('Connection created!', 'success'))

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
      state.connectionsLoading = false
      state.error = null
    },
    setSelectedPrimarySourceText: (state, action) => {
      console.log(action.payload)
      state.selectedPrimarySourceText = action.payload
    },
    setSelectedForeignSourceText: (state, action) => {
      console.log(action.payload)
      state.selectedForeignSourceText = action.payload
    },
    setConnectionTitleInput: (state, action) => {
      console.log(action.payload)
      state.connectionTitleInput = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConnection.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(createConnection.fulfilled, (state, action) => {
        return {
          ...state,
          connections: action.payload.connections,
          connectionsLoading: false,
        }
      })
      .addCase(createConnection.rejected, (state, action) => {
        return {
          ...state,
          connections: action.payload.connections,
          connectionsLoading: false,
        }
      })
      .addCase(deleteConnection.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.connectionsLoading = false
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

export const { resetConnections, setSelectedPrimarySourceText, setSelectedForeignSourceText, setConnectionTitleInput } =
  connectionsSlice.actions

export default connectionsSlice.reducer
