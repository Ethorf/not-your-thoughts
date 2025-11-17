import { createSlice } from '@reduxjs/toolkit'

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
  },
})

export const { toggleLeftSidebar } = leftSidebarSlice.actions

export default leftSidebarSlice.reducer
