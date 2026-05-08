import { createSlice } from '@reduxjs/toolkit'
import { LOGOUT } from '../actions/actionTypes'
import { createNodeEntry, createJournalEntry } from './currentEntryReducer'
import { createConnection, deleteConnection } from './connectionsReducer'
import { serializeClusterView } from '@utils/globalViewCacheSerialization'

/**
 * Cache for Global View cluster data. Invalidated when nodes or connections are created/deleted.
 * Allows returning to Global View without recomputing positions when data hasn't changed.
 */
const initialState = {
  /** Serialized cluster views and cache key - null when empty or invalid */
  cache: null,
  /** When true, cache is stale and must be recomputed on next Global View visit */
  invalidated: false,
}

const globalViewCacheSlice = createSlice({
  name: 'globalViewCache',
  initialState,
  reducers: {
    setGlobalViewCache: (state, action) => {
      const { clusterViews, cacheKey, mergedRenderOwners } = action.payload
      state.cache = {
        clusterViews: (clusterViews || []).map(serializeClusterView),
        cacheKey: cacheKey ?? null,
        mergedRenderOwners: mergedRenderOwners ?? {},
      }
      state.invalidated = false
    },
    invalidateGlobalViewCache: (state) => {
      state.invalidated = true
    },
    clearGlobalViewCache: (state) => {
      state.cache = null
      state.invalidated = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(LOGOUT, (state) => {
        state.cache = null
        state.invalidated = true
      })
      .addCase(createNodeEntry.fulfilled, (state) => {
        state.invalidated = true
      })
      .addCase(createJournalEntry.fulfilled, (state) => {
        state.invalidated = true
      })
      .addCase(createConnection.fulfilled, (state) => {
        state.invalidated = true
      })
      .addCase(deleteConnection.fulfilled, (state) => {
        state.invalidated = true
      })
  },
})

export const { setGlobalViewCache, invalidateGlobalViewCache, clearGlobalViewCache } =
  globalViewCacheSlice.actions
export default globalViewCacheSlice.reducer
