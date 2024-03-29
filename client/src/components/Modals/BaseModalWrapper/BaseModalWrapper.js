import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal } from 'react-responsive-modal'
import 'react-responsive-modal/styles.css'
import { closeModal } from '../../../redux/reducers/modalsReducer.js'

import styles from './BaseModalWrapper.module.scss'

export const BaseModalWrapper = ({ children, modalName }) => {
  const dispatch = useDispatch()
  const { isOpen, activeModal } = useSelector((state) => state.modals)

  const handleCloseModal = () => {
    dispatch(closeModal())
  }

  return (
    <Modal
      classNames={{
        modal: styles.wrapper,
        overlay: styles.overlay,
        closeButton: styles.closeButton,
      }}
      open={isOpen && activeModal === modalName}
      onClose={handleCloseModal}
      center
    >
      {children}
    </Modal>
  )
}

// { root?: React.CSSProperties; overlay?: React.CSSProperties; overlay?: React.CSSProperties; modalContainer?: React.CSSProperties; modal?: React.CSSProperties; closeButton?: React.CSSProperties; closeIcon?: React.CSSProperties; }

// All other props at https://react-responsive-modal.leopradel.com/#props
