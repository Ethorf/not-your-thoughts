import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import 'react-responsive-modal/styles.css'
import { openModal, closeModal } from '../../../redux/reducers/modalsReducer.js'
import { CustomPromptsModal } from '../CustomPromptsModal/CustomPromptsModal.js'
import { MODAL_NAMES } from '../../../constants/modalNames'

export const ModalsContainer = () => {
  const dispatch = useDispatch()

  const handleOpenModal = () => {
    dispatch(openModal(MODAL_NAMES.CUSTOM_PROMPTS)) // Example: Opens modal named 'myModal'
  }

  return (
    <div>
      <button onClick={handleOpenModal}>Open Custom Prompts modal</button>
      <CustomPromptsModal />
    </div>
  )
}

{
  /* <SaveEntryModal />
          <SuccessModal />
          <IntroModal />
          <GuestModeModal
            toggleGuestModeModalOpen={() => setGuestModeModalOpen(!guestModeModalOpen)}
            guestModeModalOpen={guestModeModalOpen}
          /> */
}
