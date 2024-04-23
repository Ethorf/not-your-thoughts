import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isOpen: false,
  activeModal: null,
  modalLoading: false,
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
  },
})

export const { openModal, closeModal } = modalsSlice.actions

export default modalsSlice.reducer
