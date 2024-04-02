import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isOpen: false,
  activeModal: null,
}

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    openModal(state, action) {
      state.isOpen = true
      state.activeModal = action.payload
    },
    closeModal(state) {
      state.isOpen = false
      state.activeModal = null
    },
    // not sure we actually need this
    setActiveModal(state, action) {
      state.activeModal = action.payload
    },
  },
})

export const { openModal, closeModal, setActiveModal } = modalsSlice.actions

export default modalsSlice.reducer
