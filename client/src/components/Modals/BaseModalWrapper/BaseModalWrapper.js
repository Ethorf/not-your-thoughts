import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import { closeModal } from '../../../redux/reducers/modalsReducer.js'
import useIsMobile from '@hooks/useIsMobile'

import styles from './BaseModalWrapper.module.scss'

export const BaseModalWrapper = ({ children, className, modalName, onOpen, onClose: customOnClose }) => {
  const dispatch = useDispatch()
  const { isOpen, activeModal } = useSelector((state) => state.modals)
  const modalIsOpen = isOpen && activeModal === modalName
  const isMobile = useIsMobile()
  const modalContentRef = useRef(null)

  const handleCloseModal = () => {
    if (customOnClose) {
      customOnClose()
    }
    dispatch(closeModal())
  }

  useEffect(() => {
    if (modalIsOpen) {
      onOpen && onOpen()
      document.body.style.overflow = 'hidden'

      if (isMobile) {
        setTimeout(() => {
          const scrollEl = modalContentRef.current
          if (scrollEl) {
            scrollEl.scrollTop = 0
          }
        }, 100)
      }
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [modalIsOpen, onOpen, isMobile])

  // body-scroll-lock (blockScroll) targets the modal CONTAINER, not the dialog.
  // Our mobile sheets are position:fixed, so they leave that container's scroll
  // flow — iOS then preventDefaults all touchmove and nothing scrolls.
  // Body overflow is already locked above / in base.scss on mobile.
  const shouldBlockScroll = !isMobile

  return (
    <Modal
      classNames={{
        root: styles.root,
        modalContainer: styles.modalContainer,
        modal: `${styles.modal} ${isMobile ? styles.mobileSheet : ''} ${className || ''}`,
        overlay: styles.overlay,
        closeButton: styles.closeButton,
      }}
      closeOnOverlayClick={true}
      open={modalIsOpen}
      onClose={handleCloseModal}
      center={!isMobile}
      blockScroll={shouldBlockScroll}
      animationDuration={isMobile ? 0 : 300}
    >
      <div ref={modalContentRef} className={styles.contentWrapper}>
        {isMobile && <div className={styles.dragHandle} />}
        {children}
      </div>
    </Modal>
  )
}

// Styling props
// { root?: React.CSSProperties; overlay?: React.CSSProperties; overlay?: React.CSSProperties; modalContainer?: React.CSSProperties; modal?: React.CSSProperties; closeButton?: React.CSSProperties; closeIcon?: React.CSSProperties; }

// All other props at https://react-responsive-modal.leopradel.com/#props
