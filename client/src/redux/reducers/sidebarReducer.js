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
  },
  extraReducers: (builder) => {
    builder.addCase(openModal, (state) => {
      state.sidebarOpen = false
    })
  },
})

export const { toggleSidebar } = sidebarSlice.actions

export default sidebarSlice.reducer
