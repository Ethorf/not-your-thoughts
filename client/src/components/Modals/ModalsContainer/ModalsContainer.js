import React from 'react'
import { CustomPromptsModal } from '../CustomPromptsModal/CustomPromptsModal.js'
import { SuccessModal } from '../SuccessModal/SuccessModal.js'

export const ModalsContainer = () => {
  return (
    <>
      <CustomPromptsModal />
      <SuccessModal />
    </>
  )
}

{
  /* <SaveEntryModal />
          <IntroModal />
          <GuestModeModal/>
          <TrackedPhrasesModal />
          */
}
