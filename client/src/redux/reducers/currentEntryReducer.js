import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axiosInstance from '@utils/axiosInstance'
import { ENTRY_TYPES } from '@constants/entryTypes'
import { SAVE_TYPES } from '@constants/saveTypes'
// import { CONNECTION_SOURCE_TYPES } from '@constants/connectionSourceTypes' // Unused - only used in commented code
// import { deleteConnection } from '@redux/reducers/connectionsReducer' // Unused - only used in commented code

import { showToast } from '@utils/toast'

const { NODE, JOURNAL } = ENTRY_TYPES

const initialState = {
  entryId: null,
  entriesLoading: false,
  entriesSaving: false,
  wordCount: 0,
  timeElapsed: 0,
  // TODO the below are temporary until we can effectively consolidate writing data and old style timeElapsed etc
  wdWordCount: 0,
  wdTimeElapsed: 0,
  wpm: 0,
  title: '',
  akas: [],
  type: JOURNAL,
  content: '',
  nodeEntriesInfo: [],
  starred: false,
  isTopLevel: false,
  isPrivate: false,
  entryContents: [],
  entryContentsLoading: false,
}

export const addAka = createAsyncThunk(
  'akas/addAka',
  async ({ entryId, aka }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { akas } = getState().currentEntry
      const akaValues = akas.map((aka) => aka.aka_value)

      const akaExists = akaValues.some((existingAka) => existingAka.toLowerCase() === aka.toLowerCase())

      if (akaExists) {
        dispatch(showToast('Duplicate, AKA not added', 'error'))

        return rejectWithValue({ message: 'Aka already exists' })
      }

      const response = await axiosInstance.post(`api/akas/${entryId}/add_aka`, { aka })
      dispatch(showToast('AKA added', 'success'))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deleteAka = createAsyncThunk(
  'akas/deleteAka',
  async ({ entryId, akaId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.delete(`api/akas/${entryId}/akas/${akaId}`)
      dispatch(showToast('AKA Deleted', 'success'))

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createNodeEntry = createAsyncThunk(
  'currentEntryReducer/createNodeEntry',
  async ({ content = '', title = '' } = {}, { rejectWithValue, dispatch }) => {
    try {
      // Remove undefined values so they don’t get sent
      const payload = {}
      if (content) payload.content = content
      if (title) payload.title = title

      const response = await axiosInstance.post('api/entries/create_node_entry', payload)

      await dispatch(fetchNodeEntriesInfo())

      dispatch(showToast('Node Created', 'success'))

      return response.data.id
    } catch (error) {
      dispatch(showToast('Node creation error', 'error'))
      return rejectWithValue(error.response?.data)
    }
  }
)

export const saveNodeEntry = createAsyncThunk(
  'currentEntryReducer/saveNodeEntry',
  async ({ saveType }, { getState, rejectWithValue, dispatch }) => {
    const { AUTO, MANUAL, EXTERNAL_CONNECTION } = SAVE_TYPES

    try {
      const currentState = await getState().currentEntry
      const fetchResponse = await dispatch(fetchEntryById(currentState.entryId))
      const fetchedEntry = fetchResponse.payload

      const titleChanged = fetchedEntry.title !== currentState.title
      const contentChanged = fetchedEntry.content[0] !== currentState.content

      if (!titleChanged && !contentChanged && saveType !== EXTERNAL_CONNECTION) {
        if (saveType === MANUAL) dispatch(showToast('Nothing to update', 'warn'))

        return currentState
      }

      const response = await axiosInstance.post('api/entries/update_node_entry', {
        entryId: currentState.entryId,
        content: currentState.content,
        title: currentState.title,
      })

      await dispatch(fetchNodeEntriesInfo())

      // Clean up obsolete connections

      // const state = getState()
      // const text = (state.currentEntry.content || '').toLowerCase()
      // const allConnections = state.connections.connections

      // const connectionsToDelete =
      //   allConnections?.filter((conn) => {
      //     const { primary_source, source_type } = conn
      //     return (
      //       (source_type === CONNECTION_SOURCE_TYPES.DIRECT || source_type === CONNECTION_SOURCE_TYPES.SINGLE_WORD) &&
      //       primary_source &&
      //       !text.includes(primary_source.toLowerCase())
      //     )
      //   }) || []

      // for (const conn of connectionsToDelete) {
      //   dispatch(deleteConnection(conn.id))
      // }

      // const cleanedConnections = connectionsToDelete.length > 0
      const cleanedConnections = false

      if (saveType === AUTO) {
        dispatch(showToast(cleanedConnections ? 'Node saved and connections cleaned' : 'Node autosaved', 'warn'))
        return ''
      } else {
        dispatch(showToast(cleanedConnections ? 'Node autosaved and connections cleaned' : 'Node updated', 'success'))
        return response.data
      }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createJournalEntry = createAsyncThunk(
  'currentEntryReducer/createJournalEntry',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('api/entries/create_journal_entry')

      await dispatch(fetchNodeEntriesInfo())

      return response.data.entry_id
    } catch (error) {
      dispatch(showToast('Node creation error', 'error'))
      return rejectWithValue(error.response?.data)
    }
  }
)

export const saveJournalEntry = createAsyncThunk(
  'currentEntryReducer/saveJournalEntry',
  async ({ entryId, content, timeElapsed, wpm, wordCount }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('api/entries/save_journal_entry', {
        content,
        num_of_words: wordCount,
        entryId,
        total_time_taken: timeElapsed,
        wpm,
      })

      dispatch(showToast('Journal Entry Saved', 'success'))

      return response.data.entry_id
    } catch (error) {
      dispatch(showToast('Error saving journal entry', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchEntryById = createAsyncThunk(
  'currentEntryReducer/fetchEntryById',
  async (entryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`api/entries/entry/${entryId}`)

      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchNodeEntriesInfo = createAsyncThunk(
  'currentEntryReducer/fetchNodeEntriesInfo',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.get('api/entries/node_entries_info')

      return response.data.nodeEntries
    } catch (error) {
      dispatch(showToast('Error fetching node entries', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

// TODO this is a duplicate of fetchEntryById, Consolidate
export const setEntryById = createAsyncThunk(
  'currentEntryReducer/setEntryById',
  async (queryParamEntryId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`api/entries/entry/${queryParamEntryId}`)
      const {
        content,
        connections,
        date,
        id: entryId,
        num_of_words: wordCount,
        starred,
        title,
        wdWordCount,
        wdTimeElapsed,
        isTopLevel,
        is_private: isPrivate,
      } = response.data

      return {
        wdWordCount,
        wdTimeElapsed,
        content: content[0],
        connections,
        date,
        entryId,
        wordCount,
        starred,
        title,
        isTopLevel,
        isPrivate: isPrivate || false,
      }
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchAkas = createAsyncThunk('akas/fetchAkas', async (entryId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`api/akas/${entryId}/akas`)
    return response.data.akas
  } catch (error) {
    return rejectWithValue(error.response.data)
  }
})

export const deleteEntry = createAsyncThunk(
  'currentEntryReducer/deleteEntry',
  async (entryId, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.delete(`api/entries/delete_entry/${entryId}`)
      dispatch(showToast('Entry Deleted', 'success'))
      return response.data
    } catch (error) {
      dispatch(showToast('Error deleting entry', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const toggleNodeStarred = createAsyncThunk(
  'currentEntryReducer/toggleNodeStarred',
  async ({ entryId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('api/entries/toggle_starred', { entryId })

      await dispatch(fetchNodeEntriesInfo())

      return response.data
    } catch (error) {
      dispatch(showToast('Error updating starred status', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const updateNodeTopLevel = createAsyncThunk(
  'currentEntryReducer/updateNodeTopLevel',
  async ({ entryId, isTopLevel }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('api/entries/update_node_top_level', {
        entryId,
        isTopLevel,
      })

      await dispatch(fetchNodeEntriesInfo())

      return response.data
    } catch (error) {
      dispatch(showToast('Error updating top level status', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const toggleEntryIsPrivate = createAsyncThunk(
  'currentEntryReducer/toggleEntryIsPrivate',
  async ({ entryId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axiosInstance.post('api/entries/toggle_is_private', { entryId })

      await dispatch(fetchNodeEntriesInfo())

      return response.data
    } catch (error) {
      dispatch(showToast('Error updating privacy status', 'error'))
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchPublicEntry = createAsyncThunk(
  'currentEntryReducer/fetchPublicEntry',
  async ({ entryId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/entries/public/entry/${entryId}?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch entry')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch entry' })
    }
  }
)

export const fetchPublicNodeEntriesInfo = createAsyncThunk(
  'currentEntryReducer/fetchPublicNodeEntriesInfo',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/entries/public/node_entries_info/${userId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: 'Failed to fetch nodes' }))
        throw new Error(errorData.msg || 'Failed to fetch nodes')
      }
      const data = await response.json()
      return data.nodeEntries || []
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch nodes' })
    }
  }
)

export const fetchPublicEntryContents = createAsyncThunk(
  'currentEntryReducer/fetchPublicEntryContents',
  async ({ entryId, userId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/entries/public/entry_contents/${entryId}?userId=${userId}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch entry contents' }))
        throw new Error(errorData.message || 'Failed to fetch entry contents')
      }
      const data = await response.json()
      return data.contents || []
    } catch (error) {
      return rejectWithValue({ message: error.message || 'Failed to fetch entry contents' })
    }
  }
)

const currentEntrySlice = createSlice({
  name: 'currentEntryReducer',
  initialState,
  reducers: {
    setAkas: (state, action) => {
      state.akas = action.payload
    },
    setWordCount: (state, action) => {
      state.wordCount = action.payload
    },
    setEntryId: (state, action) => {
      state.entryId = action.payload
    },
    setCharCount: (state, action) => {
      state.charCount = action.payload
    },
    setTitle: (state, action) => {
      state.title = action.payload
    },
    setTitleAndResetAll: (state, action) => {
      Object.assign(state, { ...initialState, title: action.payload })
    },
    setTimeElapsed(state, action) {
      state.timeElapsed = action.payload
    },
    setConnections: (state, action) => {
      state.connections = action.payload
    },
    setTypeNode: (state) => {
      state.type = NODE
    },
    setTypeJournal: (state) => {
      state.type = JOURNAL
    },
    setContent: (state, action) => {
      state.content = action.payload
    },
    setWPM(state, action) {
      state.wpm = action.payload
    },
    resetCurrentEntryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAkas.fulfilled, (state, action) => {
        state.akas = action.payload
      })
      .addCase(addAka.fulfilled, (state, action) => {
        state.akas = [...state.akas, action.payload.aka]
      })
      .addCase(deleteAka.fulfilled, (state, action) => {
        state.akas = action.payload.akas
      })
      .addCase(createNodeEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(createNodeEntry.fulfilled, (state, action) => {
        state.entriesLoading = false
        state.nodeEntriesInfo.push(action.payload)
      })
      .addCase(createJournalEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(createJournalEntry.fulfilled, (state, action) => {
        return {
          ...state,
          entriesLoading: false,
          entryId: action.payload,
        }
      })
      .addCase(saveJournalEntry.pending, (state) => {
        state.entriesLoading = true
      })
      .addCase(saveJournalEntry.fulfilled, (state, action) => {
        return {
          ...state,
          entriesLoading: false,
          entryId: action.payload,
        }
      })
      .addCase(saveNodeEntry.pending, (state) => {
        return { ...state, entriesLoading: true, entriesSaving: true }
      })
      .addCase(saveNodeEntry.fulfilled, (state, action) => {
        // Will only receive a payload if not an autosave update
        if (action.payload.content) {
          return {
            ...state,
            entriesLoading: false,
            entriesSaving: false,
            content: action.payload.content,
          }
        } else {
          return {
            ...state,
            entriesLoading: false,
            entriesSaving: false,
          }
        }
      })
      .addCase(fetchEntryById.pending, (state) => {
        return {
          ...state,
          entriesLoading: true,
        }
      })
      .addCase(fetchEntryById.fulfilled, (state) => {
        return {
          ...state,
          entriesLoading: false,
        }
      })
      .addCase(setEntryById.pending, (state) => {
        return {
          ...state,
          entriesLoading: true,
        }
      })
      .addCase(setEntryById.fulfilled, (state, action) => {
        return {
          ...state,
          ...action.payload,
          entriesLoading: false,
        }
      })
      .addCase(fetchNodeEntriesInfo.pending, (state) => {
        return {
          ...state,
          entriesLoading: true,
        }
      })
      .addCase(fetchNodeEntriesInfo.fulfilled, (state, action) => {
        return {
          ...state,
          nodeEntriesInfo: action.payload,
          entriesLoading: false,
        }
      })
      .addCase(deleteEntry.pending, (state) => {
        return {
          ...state,
          entriesLoading: true,
        }
      })
      .addCase(deleteEntry.fulfilled, (state) => {
        return {
          ...state,
          entriesLoading: false,
        }
      })
      .addCase(toggleNodeStarred.fulfilled, (state, action) => {
        const { entryId, starred } = action.payload
        if (state.entryId === entryId) {
          state.starred = starred
        }
      })
      .addCase(updateNodeTopLevel.fulfilled, (state, action) => {
        const { entryId, isTopLevel } = action.payload
        if (state.entryId === entryId) {
          state.isTopLevel = isTopLevel
        }
      })
      .addCase(toggleEntryIsPrivate.fulfilled, (state, action) => {
        const { entryId, isPrivate } = action.payload
        if (state.entryId === entryId) {
          state.isPrivate = isPrivate
        }
      })
      .addCase(fetchPublicEntry.pending, (state, action) => {
        const requestedEntryId = action.meta.arg?.entryId
        // Only set loading if we're fetching a different entry than what's currently loaded
        const needsLoading = !state.entryId || state.entryId !== requestedEntryId || !state.title || !state.content
        return {
          ...state,
          entriesLoading: needsLoading,
          entryContents: needsLoading ? [] : state.entryContents, // Only clear if actually loading new entry
        }
      })
      .addCase(fetchPublicEntry.fulfilled, (state, action) => {
        const {
          content,
          id: entryId,
          num_of_words: wordCount,
          title,
        } = action.payload

        return {
          ...state,
          entryId,
          title,
          content: content && content[0] ? content[0] : '',
          wordCount,
          entriesLoading: false,
        }
      })
      .addCase(fetchPublicEntry.rejected, (state) => {
        return {
          ...state,
          entriesLoading: false,
        }
      })
      .addCase(fetchPublicNodeEntriesInfo.pending, (state) => {
        // Only set loading if we don't already have nodeEntriesInfo
        return {
          ...state,
          entriesLoading: !state.nodeEntriesInfo || state.nodeEntriesInfo.length === 0,
        }
      })
      .addCase(fetchPublicNodeEntriesInfo.fulfilled, (state, action) => {
        return {
          ...state,
          nodeEntriesInfo: action.payload,
          entriesLoading: false,
        }
      })
      .addCase(fetchPublicNodeEntriesInfo.rejected, (state) => {
        return {
          ...state,
          entriesLoading: false,
        }
      })
      .addCase(fetchPublicEntryContents.pending, (state) => {
        state.entryContentsLoading = true
      })
      .addCase(fetchPublicEntryContents.fulfilled, (state, action) => {
        state.entryContents = action.payload
        state.entryContentsLoading = false
      })
      .addCase(fetchPublicEntryContents.rejected, (state) => {
        state.entryContentsLoading = false
        state.entryContents = []
      })
  },
})

export const {
  resetCurrentEntryState,
  setAkas,
  setEntryId,
  setWordCount,
  setCharCount,
  setTitle,
  setTitleAndResetAll,
  setTimeElapsed,
  setConnections,
  setTypeNode,
  setTypeJournal,
  setContent,
  setWPM,
} = currentEntrySlice.actions

export default currentEntrySlice.reducer
