import { createSlice } from '@reduxjs/toolkit'
import { openModal } from './modalsReducer'

const initialState = {
  leftSidebarOpen: false,
}

const leftSidebarSlice = createSlice({
  name: 'leftSidebar',
  initialState,
  reducers: {
    toggleLeftSidebar(state) {
      state.leftSidebarOpen = !state.leftSidebarOpen
    },
    openLeftSidebar(state) {
      state.leftSidebarOpen = true
    },
    closeLeftSidebar(state) {
      state.leftSidebarOpen = false
    },
  },
  extraReducers: (builder) => {
    builder.addCase(openModal, (state) => {
      state.leftSidebarOpen = false
    })
    builder.addMatcher(
      (action) => action.type === 'sidebar/openSidebar',
      (state) => {
        state.leftSidebarOpen = false
      }
    )
  },
})

export const { toggleLeftSidebar, openLeftSidebar, closeLeftSidebar } = leftSidebarSlice.actions

export default leftSidebarSlice.reducer
