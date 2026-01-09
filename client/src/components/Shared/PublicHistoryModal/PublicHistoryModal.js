import React from 'react'
import { useSelector } from 'react-redux'
import 'react-responsive-modal/styles.css'

import PublicHistory from '@components/Shared/PublicHistory/PublicHistory'
import { BaseModalWrapper } from '@components/Modals/BaseModalWrapper/BaseModalWrapper'
import { MODAL_NAMES } from '@constants/modalNames'

import styles from './PublicHistoryModal.module.scss'

/**
 * Public History Modal - shows version history for a node entry
 * Uses Redux state management through BaseModalWrapper
 */
export const PublicHistoryModal = () => {
  const { isOpen, activeModal, modalData } = useSelector((state) => state.modals)
  const modalIsOpen = isOpen && activeModal === MODAL_NAMES.PUBLIC_HISTORY

  // Get data from modalData (set when opening the modal)
  const entryId = modalData?.entryId
  const userId = modalData?.userId
  const onVersionSelect = modalData?.onVersionSelect

  return (
    <BaseModalWrapper modalName={MODAL_NAMES.PUBLIC_HISTORY} className={styles.historyModal}>
      <h2 className={styles.title}>Version History</h2>
      <div className={styles.content}>
        <PublicHistory entryId={entryId} userId={userId} isExpanded={modalIsOpen} onVersionSelect={onVersionSelect} />
      </div>
    </BaseModalWrapper>
  )
}

export default PublicHistoryModal
