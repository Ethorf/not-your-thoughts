import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import { closeModal } from '../../../redux/reducers/modalsReducer.js'
import useIsMobile from '@hooks/useIsMobile'

import styles from './BaseModalWrapper.module.scss'

export const BaseModalWrapper = ({ children, className, modalName, onOpen }) => {
  const dispatch = useDispatch()
  const { isOpen, activeModal } = useSelector((state) => state.modals)
  const modalIsOpen = isOpen && activeModal === modalName
  const isMobile = useIsMobile()
  const modalContentRef = useRef(null)

  const handleCloseModal = () => {
    dispatch(closeModal())
  }
  
  useEffect(() => {
    if (modalIsOpen) {
      onOpen && onOpen()
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Scroll modal to top on mobile when it opens
      if (isMobile) {
        // Use setTimeout to ensure modal is rendered before scrolling
        setTimeout(() => {
          // Try multiple selectors to find the modal element
          const modalElement = modalContentRef.current?.closest('[class*="react-responsive-modal-modal"]') ||
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
  }, [modalIsOpen, onOpen, isMobile])

  return (
    <Modal
      classNames={{
        root: styles.root,
        modalContainer: styles.modalContainer,
        modal: [className, styles.wrapper],
        overlay: styles.overlay,
        closeButton: styles.closeButton,
      }}
      open={modalIsOpen}
      onClose={handleCloseModal}
      center={false}
      blockScroll={true}
    >
      <div ref={modalContentRef}>
        {children}
      </div>
    </Modal>
  )
}

// Styling props
// { root?: React.CSSProperties; overlay?: React.CSSProperties; overlay?: React.CSSProperties; modalContainer?: React.CSSProperties; modal?: React.CSSProperties; closeButton?: React.CSSProperties; closeIcon?: React.CSSProperties; }

// All other props at https://react-responsive-modal.leopradel.com/#props
