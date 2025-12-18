import React from 'react'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import PublicHistory from '@components/Shared/PublicHistory/PublicHistory'
import styles from './PublicHistoryModal.module.scss'

const PublicHistoryModal = ({ isOpen, onClose, entryId, userId, onVersionSelect }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center={false} // Disable centering for full-screen mobile
      classNames={{
        modal: styles.modal,
        overlay: styles.overlay,
        closeButton: styles.closeButton,
      }}
    >
      <PublicHistory entryId={entryId} userId={userId} isExpanded={isOpen} onVersionSelect={onVersionSelect} />
    </Modal>
  )
}

export default PublicHistoryModal

