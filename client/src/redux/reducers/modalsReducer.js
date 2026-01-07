import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isOpen: false,
  activeModal: null,
  modalLoading: false,
  modalData: null, // Optional data to pass to the modal
}

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    openModal(state, action) {
      state.isOpen = true
      // Support both simple string or object with name and data
      if (typeof action.payload === 'string') {
        state.activeModal = action.payload
        state.modalData = null
      } else {
        state.activeModal = action.payload.name
        state.modalData = action.payload.data || null
      }
    },
    closeModal(state) {
      state.isOpen = false
      state.activeModal = null
      state.modalData = null
    },
    setModalData(state, action) {
      state.modalData = action.payload
    },
  },
})

export const { openModal, closeModal, setModalData } = modalsSlice.actions

export default modalsSlice.reducer
