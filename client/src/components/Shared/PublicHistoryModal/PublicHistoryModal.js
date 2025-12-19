import React, { useEffect, useRef } from 'react'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import PublicHistory from '@components/Shared/PublicHistory/PublicHistory'
import useIsMobile from '@hooks/useIsMobile'
import styles from './PublicHistoryModal.module.scss'

const PublicHistoryModal = ({ isOpen, onClose, entryId, userId, onVersionSelect }) => {
  const isMobile = useIsMobile()
  const contentRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Scroll modal to top on mobile when it opens
      if (isMobile) {
        setTimeout(() => {
          const modalElement = contentRef.current?.closest('[class*="react-responsive-modal-modal"]') ||
                               document.querySelector('[class*="react-responsive-modal-modal"]')
          if (modalElement) {
            modalElement.scrollTop = 0
          }
        }, 100)
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = ''
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMobile])

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center={false} // Disable centering for full-screen mobile
      blockScroll={true}
      classNames={{
        root: styles.root,
        modalContainer: styles.modalContainer,
        modal: styles.modal,
        overlay: styles.overlay,
        closeButton: styles.closeButton,
      }}
    >
      <div ref={contentRef}>
        <PublicHistory entryId={entryId} userId={userId} isExpanded={isOpen} onVersionSelect={onVersionSelect} />
      </div>
    </Modal>
  )
}

export default PublicHistoryModal

