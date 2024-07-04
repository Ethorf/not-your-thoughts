import React from 'react'
import { AreYouSureModal } from '../AreYouSureModal/AreYouSureModal.js'
import { CustomPromptsModal } from '../CustomPromptsModal/CustomPromptsModal.js'
import { JournalContentModal } from '../JournalContentModal/JournalContentModal.js'
import { AkasInputModal } from '../AkasInputModal/AkasInputModal.js'
import { SuccessModal } from '../SuccessModal/SuccessModal.js'
import { NodeContentModal } from '../NodeContentModal/NodeContentModal.js'
import { ConnectionsModal } from '../ConnectionsModal/ConnectionsModal.js'

export const ModalsContainer = () => {
  return (
    <>
      <AreYouSureModal />
      <CustomPromptsModal />
      <AkasInputModal />
      <SuccessModal />
      <JournalContentModal />
      <NodeContentModal />
      <ConnectionsModal />
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
