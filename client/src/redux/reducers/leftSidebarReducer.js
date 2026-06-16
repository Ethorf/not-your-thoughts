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
  },
  extraReducers: (builder) => {
    builder.addCase(openModal, (state) => {
      state.leftSidebarOpen = false
    })
  },
})

export const { toggleLeftSidebar } = leftSidebarSlice.actions

export default leftSidebarSlice.reducer
