import React, { useRef, useState, useEffect } from 'react'
import { connect, useSelector } from 'react-redux'
import { openSaveEntryModal, closeSaveEntryModal } from '../../redux/actions/modalActions.js'
import { TimelineMax } from 'gsap'
import '../../pages/Main/Main.scss'
import './saveEntryModal.scss'

const SaveEntryModal = ({ modals, openSaveEntryModal, closeSaveEntryModal }) => {
  const mode = useSelector((state) => state.modes.mode)

  let modalContentContainer = useRef(null)
  const [contentAnimation, setContentAnimation] = useState(null)

  const contentTl = new TimelineMax({ paused: true })

  const openModalContentAnimation = () => {
    setContentAnimation(
      contentTl
        .to(modalContentContainer, { duration: 0.2, y: 60, opacity: 1 })
        .to(modalContentContainer, { duration: 1.3, opacity: 1 })
        .to(modalContentContainer, { duration: 0.5, y: -200, opacity: 0 })
        .play()
    )
  }

  const openModalAll = () => {
    openModalContentAnimation()
    setTimeout(() => {
      closeSaveEntryModal()
    }, 3000)
  }

  useEffect(() => {
    if (modals.saveEntryModalOpen) {
      openModalAll()
    }
  }, [modals])

  return (
    <div className={`save-entry-modal${mode}`}>
      <div
        className={`${modals.saveEntryModalOpen ? 'save-entry-modal__open' : 'save-entry-modal__closed'}`}
        ref={(div) => (modalContentContainer = div)}
      >
        <h1 className="save-entry-modal__text">Entry Saved!</h1>
        {/* <button onClick={closeModalAll}>SaveEntry Modal CloseTest</button> */}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  modals: state.modals,
})
export default connect(mapStateToProps, {
  openSaveEntryModal,
  closeSaveEntryModal,
})(SaveEntryModal)
