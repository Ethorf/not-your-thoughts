import React, { Fragment, useRef, useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { TimelineMax } from 'gsap'
import '../../styles/shared.scss'
import './introModal.scss'
//Redux Actions
import { openIntroModal, closeIntroModal } from '../../redux/actions/modalActions.js'
import { loadUser, setFirstLogin } from '../../redux/actions/authActions'

const IntroModal = ({ auth: { user }, modals, openIntroModal, closeIntroModal, setFirstLogin }) => {
  let modalOverlayContainer = useRef(null)
  let modalContentContainer = useRef(null)
  const [overlayAnimation, setOverlayAnimation] = useState(null)
  const [contentAnimation, setContentAnimation] = useState(null)
  const overlayTl = new TimelineMax({ paused: true })
  const contentTl = new TimelineMax({ paused: true })

  const openModalOverlayAnimation = () => {
    setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, opacity: 1 }).play())
  }
  const openModalContentAnimation = () => {
    setContentAnimation(contentTl.to(modalContentContainer, { duration: 1, y: 100, opacity: 1 }).play())
  }
  const closeModalOverlayAnimation = () => {
    setOverlayAnimation(overlayTl.to(modalOverlayContainer, { duration: 1, opacity: 1 }).reverse())
  }
  const closeModalContentAnimation = () => {
    setContentAnimation(contentTl.to(modalContentContainer, { duration: 1, y: 100, opacity: 1 }).reverse())
  }
  const openModalAll = () => {
    openModalOverlayAnimation()
    openModalContentAnimation()
    openIntroModal()
    setFirstLogin()
  }
  const closeModalAll = () => {
    closeModalContentAnimation()
    closeModalOverlayAnimation()
    closeIntroModal()
  }
  useEffect(() => {
    if (user !== null && user.firstLogin === true) {
      openModalAll()
    }
  }, [user])
  return (
    <div className={` ${modals.introModalOpen ? 'intro-modal' : 'intro-modal__modalCLosed'} `}>
      {/*}	<button onClick={openModalAll}>Modal Open Test</button>
	<button onClick={closeModalAll}>Modal Close Test</button> */}

      <div
        className={`${modals.introModalOpen ? 'main__modal2OverlayOpen' : 'main__modal2OverlayClosed'}`}
        ref={(div) => (modalOverlayContainer = div)}
      ></div>
      <div
        className={`${modals.introModalOpen ? 'intro-modal__modal' : 'intro-modal__modalClosed'}`}
        ref={(div) => (modalContentContainer = div)}
      >
        <h2 className="intro-modal__header">
          Welcome to
          <br /> Not Your Thoughts {user && user.name.split(' ')[0]}!
        </h2>
        <div className="intro-modal__main-container">
          <h2 className="intro-modal__description">
            Congratulations on taking the first step towards establishing a journalling practice! You can begin noting
            thoughts on this main page and watch them fancy-pancy progress-pillars fill up as you progress towards your
            daily goal. Saved entries and other settings like adjusting your daily goal or turning off progress sounds
            can be accessed via the 'Profile' page. Any questions can be submitted via the 'About' page. Let the noting
            begin!
          </h2>
          <button onClick={closeModalAll} className="intro-modal__close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

IntroModal.propTypes = {
  auth: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  modals: state.modals,
  mode: state.modes.mode,
})

export default connect(mapStateToProps, {
  loadUser,
  openIntroModal,
  closeIntroModal,
  setFirstLogin,
})(IntroModal)
