import { createSlice } from '@reduxjs/toolkit'
import { openModal } from './modalsReducer'

const initialState = {
  sidebarOpen: false,
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    openSidebar(state) {
      state.sidebarOpen = true
    },
    closeSidebar(state) {
      state.sidebarOpen = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(openModal, (state) => {
      state.sidebarOpen = false
    })
    builder.addMatcher(
      (action) => action.type === 'leftSidebar/openLeftSidebar',
      (state) => {
        state.sidebarOpen = false
      }
    )
  },
})

export const { toggleSidebar, openSidebar, closeSidebar } = sidebarSlice.actions

export default sidebarSlice.reducer
