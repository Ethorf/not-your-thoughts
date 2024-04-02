import React from 'react'
import { CustomPromptsModal } from '../CustomPromptsModal/CustomPromptsModal.js'
import { JournalContentModal } from '../JournalContentModal/JournalContentModal.js'

import { SuccessModal } from '../SuccessModal/SuccessModal.js'
import { NodeContentModal } from '../NodeContentModal/NodeContentModal.js'

export const ModalsContainer = () => {
  return (
    <>
      <CustomPromptsModal />
      <SuccessModal />
      <JournalContentModal />
      <NodeContentModal />
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
