import React, { useState, useRef, useEffect, createRef } from 'react'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { gsap } from 'gsap'
import { CSSPlugin } from 'gsap/CSSPlugin'
import { TimelineLite } from 'gsap/all'
import { toggleGuestMode } from '../../redux/actions/authActions.js'
//Component Imports
import { You } from '../../components/svgs/you.js'
import { Are } from '../../components/svgs/are.js'
import { RachelDoodle1 } from '../../components/svgs/rachel-doodle-1.js'
import { RachelDoodle2 } from '../../components/svgs/rachel-doodle-2.js'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'

//Misc Imports
import bgOverlayTextureWhite from '../../assets/Background-Images/background-texture-bigPan-white-blur.png'
import './Start.scss'

gsap.registerPlugin(CSSPlugin)

const Landing = ({ toggleGuestMode }) => {
  const history = useHistory()
  let allContainer = useRef(null)
  let youareContainer = useRef(null)
  let notContainer = useRef(null)
  let yourContainer = useRef(null)
  let thoughtsContainer = useRef(null)
  let descriptionContainer = useRef(null)
  let loginButtonContainer = useRef(null)
  let registerButtonContainer = useRef(null)
  let guestModeButtonContainer = useRef(null)
  let browseNetworksButtonContainer = useRef(null)
  let bgImgContainer = useRef(null)
  let lengthRef = createRef()
  const [pathLength, setPathLength] = useState()

  useEffect(() => {
    let youareTween = new TimelineLite({ paused: true })
      .from(youareContainer, {
        duration: 2.5,
        y: '-200px',
        ease: 'power1.out',
        opacity: 0,
      })
      .to(youareContainer, {
        duration: 2.5,
        y: '0',
        ease: 'power1.out',
        opacity: 1,
      })
    youareTween.play()
    let notTween = new TimelineLite({ paused: true })
      .from(notContainer, {
        duration: 2.6,
        x: '-8vw',
        opacity: 0,
      })
      .to(notContainer, {
        duration: 2.6,
        x: '0',
        opacity: 1,
      })
    setTimeout(() => {
      notTween.play()
    }, 900)
    let yourTween = new TimelineLite({ paused: true })
      .from(yourContainer, {
        duration: 2,
        y: '150px',
        opacity: 0,
      })
      .to(yourContainer, {
        duration: 2,
        y: 0,
        opacity: 1,
      })
    setTimeout(() => {
      yourTween.play()
    }, 1000)
    let thoughtsTween = new TimelineLite({ paused: true })
      .from(thoughtsContainer, {
        duration: 2,
        x: '6vw',
        opacity: 0,
      })
      .to(thoughtsContainer, {
        duration: 2,
        x: 0,
        opacity: 1,
      })
    setTimeout(() => {
      thoughtsTween.play()
    }, 900)
    let descriptionTween = new TimelineLite({ paused: true })
      .from(descriptionContainer, {
        duration: 2,
        y: -1,
        opacity: 0,
      })
      .to(descriptionContainer, {
        duration: 2,
        y: 0,
        opacity: 1,
      })
    setTimeout(() => {
      descriptionTween.play()
    }, 1500)

    let loginButtonTween = new TimelineLite({ paused: true }).to(loginButtonContainer, {
      duration: 3,
      y: -1,
      ease: 'slow(0.7, 0.7, false)',
      opacity: 1,
    })
    let registerButtonTween = new TimelineLite({ paused: true }).to(registerButtonContainer, {
      duration: 3,
      y: -1,
      ease: 'slow(0.7, 0.7, false)',
      opacity: 1,
    })
    let guestModeButtonTween = new TimelineLite({ paused: true }).to(guestModeButtonContainer, {
      duration: 3,
      y: -1,
      ease: 'slow(0.7, 0.7, false)',
      opacity: 1,
    })
    let browseNetworksButtonTween = new TimelineLite({ paused: true }).to(browseNetworksButtonContainer, {
      duration: 3,
      y: -1,
      ease: 'slow(0.7, 0.7, false)',
      opacity: 1,
    })
    setTimeout(() => {
      loginButtonTween.play()
      registerButtonTween.play()
      guestModeButtonTween.play()
      browseNetworksButtonTween.play()
    }, 4000)
    let allTween = new TimelineLite({ paused: true }).to(allContainer, {
      duration: 3.5,
      y: -130,
      opacity: 1,
    })
    setTimeout(() => {
      allTween.play()
    }, 3000)
    let bgImgTween = new TimelineLite({ paused: true }).to(bgImgContainer, { duration: 2, opacity: 0.25 })
    setTimeout(() => {
      youareTween.reverse()
    }, 3100)
    setTimeout(() => {
      bgImgTween.play()
    }, 3500)
    setTimeout(() => {
      bgImgTween.reverse()
    }, 6500)
  }, [])
  return (
    <div ref={(div) => (allContainer = div)} className="landing">
      <img
        ref={(img) => (bgImgContainer = img)}
        className="landing__bg-img"
        src={bgOverlayTextureWhite}
        alt="background"
      />

      <h2 ref={(img) => (youareContainer = img)} className="landing__you-are">
        <You />
        <Are />
      </h2>
      <h1 className="landing__title">
        <div className="landing__title-text" ref={(h1) => (notContainer = h1)}>
          Not
        </div>
        <div className="landing__title-text" ref={(h1) => (yourContainer = h1)}>
          Your{' '}
        </div>
        <div className="landing__title-text" ref={(h1) => (thoughtsContainer = h1)}>
          Thoughts{' '}
        </div>
      </h1>
      <div ref={(p) => (descriptionContainer = p)} className="landing__description-container">
        <RachelDoodle1 />
        <p className="landing__description">
          Not Your Thoughts is a mindfulness-based gamified journaling website dedicated to empowering the average human
          to develop a healthy relationship with the whirlwind of thoughts they find themselves inside daily. Through a
          consistent daily journaling practice and engagement with mindfulness prompts, the user will unlock new modes,
          features, and achievements as they progress towards the solidification of their practice.
        </p>
        <RachelDoodle2 />
      </div>
      <div className="landing__all-buttons-container">
        <DefaultButton
          ref={(button) => (loginButtonContainer = button)}
          onClick={() => history.push('/login')}
          className="landing__login-button"
        >
          Login
        </DefaultButton>

        <DefaultButton
          ref={(button) => (registerButtonContainer = button)}
          onClick={() => history.push('/register')}
          className="landing__register-button"
        >
          Register
        </DefaultButton>
        <DefaultButton
          ref={(button) => (browseNetworksButtonContainer = button)}
          onClick={() => history.push('/public-dashboard?userId=ethorf')}
          className="landing__register-button"
          style={{ marginTop: '10px' }}
        >
          Browse Networks
        </DefaultButton>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  guestMode: state.auth.guestMode,
})

export default connect(mapStateToProps, { toggleGuestMode })(Landing)
