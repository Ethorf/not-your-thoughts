import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'
import { CONNECTION_TYPES, FRONT_TO_BACK_CONN_TYPES } from '@constants/connectionTypes'
import { CONNECTION_ENTRY_SOURCES } from '@constants/connectionEntrySources'
import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes'
import { SAVE_TYPES } from '@constants/saveTypes'

import { showToast } from '@utils/toast'
import { hasOneWord } from '@utils/hasOneWord'

import { saveNodeEntry } from '@redux/reducers/currentEntryReducer'

const {
  FRONTEND: { SIBLING, EXTERNAL },
} = CONNECTION_TYPES

const { PRIMARY, FOREIGN } = CONNECTION_ENTRY_SOURCES
const { DIRECT, SINGLE_WORD, DESCRIPTIVE } = CONNECTION_SOURCE_TYPES

const initialState = {
  connections: [],
  allConnections: [], // All connections across all nodes for Global view
  connectionsLoading: false,
  connectionSourceType: DIRECT,
  connectionTitleInput: '',
  externalConnectionSource: null,
  modalConnectionType: SIBLING,
  selectedPrimarySourceText: '',
  selectedForeignSourceText: '',
}

export const createConnection = createAsyncThunk(
  'connections/create_connection',
  async (
    {
      connection_type,
      current_entry_id,
      primary_entry_id,
      foreign_entry_id,
      primary_source,
      foreign_source,
      source_type,
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axiosInstance.post('api/connections/create_connection', {
        connection_type: connection_type === EXTERNAL ? connection_type : FRONT_TO_BACK_CONN_TYPES[connection_type],
        primary_entry_id,
        foreign_entry_id,
        current_entry_id,
        primary_source,
        foreign_source,
        source_type,
      })

      dispatch(saveNodeEntry({ saveType: SAVE_TYPES.MANUAL }))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deleteConnection = createAsyncThunk(
  'connections/delete_connection',
  async (connectionId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`api/connections/delete_connection/${connectionId}`)
      return { connectionId, ...response.data }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchConnections = createAsyncThunk('connections/', async (entry_id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`api/connections/${entry_id}`)

    return response.data.connections
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const fetchAllConnections = createAsyncThunk(
  'connections/fetchAllConnections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('api/connections/all_connections')
      return response.data.connections
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchPublicConnections = createAsyncThunk(
  'connections/fetchPublicConnections',
  async ({ entryId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/connections/public/${entryId}?userId=${userId}`)
      if (!response.ok) {
        if (response.status === 204) {
          // No connections found - this is okay
          return []
        }
        throw new Error('Failed to fetch connections')
      }
      const data = await response.json()
      return data.connections || []
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch connections' })
    }
  }
)

export const fetchConnectionsDirect = createAsyncThunk(
  'connections/fetchConnectionsDirect',
  async (entry_id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`api/connections/${entry_id}`)
      console.log('<<<<<< response.data >>>>>>>>> is: <<<<<<<<<<<<')
      console.log(response.data)
      return response.data.connections
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateConnection = createAsyncThunk(
  'connections/update_connection',
  async ({ connectionId, updatedFields, current_entry_id }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.put(`api/connections/update_connection/${connectionId}`, {
        ...updatedFields,
        current_entry_id,
      })
      // TODO maybe here we just make sure to return all the connections in a single call as well
      await dispatch(fetchConnections(current_entry_id))
      return response.data
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
    setModalConnectionType: (state, action) => {
      state.modalConnectionType = action.payload
    },
    setConnectionSourceType: (state, action) => {
      state.connectionSourceType = action.payload
    },
    setSelectedPrimarySourceText: (state, action) => {
      state.selectedPrimarySourceText = action.payload
    },
    setSelectedForeignSourceText: (state, action) => {
      state.selectedForeignSourceText = action.payload
    },
    setConnectionTitleInput: (state, action) => {
      state.connectionTitleInput = action.payload
    },
    getSelectedText: (state, action) => {
      const entry_source = action.payload

      if (window.getSelection) {
        const selection = window.getSelection()
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          const container = document.createElement('div')
          container.appendChild(range.cloneContents())

          if (hasOneWord(container.innerHTML)) {
            state.connectionSourceType = SINGLE_WORD
          } else {
            state.connectionSourceType = DIRECT
          }

          if (entry_source === PRIMARY) {
            state.selectedPrimarySourceText = container.innerHTML
          } else if (entry_source === FOREIGN) {
            state.selectedForeignSourceText = container.innerHTML
          }
        }
      }
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
        state.connectionsLoading = false
        state.error = action.payload
      })
      .addCase(fetchConnections.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        return {
          ...state,
          connections: action.payload,
          connectionsLoading: false,
        }
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload
      })
      .addCase(updateConnection.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(updateConnection.fulfilled, (state, action) => {
        state.connectionsLoading = false
        // **** HMM this broke some stuff but maybe it was being used for connections modal
        // state.connections = action.payload.connections
      })
      .addCase(updateConnection.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload
      })
      .addCase(fetchAllConnections.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(fetchAllConnections.fulfilled, (state, action) => {
        state.allConnections = action.payload
        state.connectionsLoading = false
      })
      .addCase(fetchAllConnections.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload
      })
      .addCase(fetchPublicConnections.pending, (state) => {
        state.connectionsLoading = true
      })
      .addCase(fetchPublicConnections.fulfilled, (state, action) => {
        return {
          ...state,
          connections: action.payload,
          connectionsLoading: false,
        }
      })
      .addCase(fetchPublicConnections.rejected, (state, action) => {
        state.connectionsLoading = false
        state.error = action.payload
        // Set connections to empty array on error instead of undefined
        state.connections = []
      })
  },
})

export const {
  resetConnections,
  setSelectedPrimarySourceText,
  setSelectedForeignSourceText,
  setConnectionTitleInput,
  setConnectionSourceType,
  setModalConnectionType,
  getSelectedText,
} = connectionsSlice.actions

export default connectionsSlice.reducer
