import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { TimelineLite } from 'gsap/all'

// Styles
import '../../styles/rubberDucky.scss'
import './navBarSide.scss'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'

// Rdux
import { resetCurrentEntryState, createNodeEntry, createJournalEntry } from '@redux/reducers/currentEntryReducer'
import { logout } from '@redux/actions/authActions'

const NavBarSide = () => {
  const [navOpen, setNavOpen] = useState(false)
  const navBarContainer = useRef(null)
  const linksContainer = useRef(null)
  const arrowContainer = useRef(null)
  const navBarTween = useRef(null)
  const linksTween = useRef(null)
  const arrowTween = useRef(null)

  const history = useHistory()
  const dispatch = useDispatch()
  const mode = useSelector((state) => state.modes.mode)
  const guestMode = useSelector((state) => state.auth.guestMode)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    navBarTween.current = new TimelineLite({ paused: true }).to(navBarContainer.current, {
      duration: 0.4,
      x: 45,
    })

    linksTween.current = new TimelineLite({ paused: true }).to(linksContainer.current, {
      duration: 1,
      x: 0,
      opacity: 1,
    })

    arrowTween.current = new TimelineLite({ paused: true }).to(arrowContainer.current, {
      duration: 1,
    })
  }, [])

  const openNav = () => {
    navBarTween.current.play()
    linksTween.current.play()
    arrowTween.current.play()
    setNavOpen(true)
  }

  const closeNav = () => {
    navBarTween.current.reverse()
    linksTween.current.reverse()
    arrowTween.current.reverse()
    setNavOpen(false)
  }

  const handleNewNodeEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newNode = await dispatch(createNodeEntry())

    closeNav()

    history.push(`/edit-node-entry?entryId=${newNode.payload}`)
  }

  const handleNewJournalEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newJournal = await dispatch(createJournalEntry())

    closeNav()
    return history.push(`/create-journal-entry?entryId=${newJournal.payload}`)
  }

  return (
    <div ref={navBarContainer} className="nav">
      <button
        className={mode === '-.light' ? 'rubberDucky__nav-arrow-container' : 'nav__arrow-container'}
        onClick={navOpen ? closeNav : openNav}
      >
        <img
          ref={arrowContainer}
          className={`nav__arrow ${navOpen ? 'nav__arrow-rotate' : ''}`}
          src={arrow}
          alt="hamburger"
        />
      </button>
      <div className={`nav__links-container${mode}`} ref={linksContainer}>
        <NavLink exact to="/dashboard" activeClassName="nav__active" className={`nav__link${mode}`}>
          Dashboard
        </NavLink>
        <TextButton navLink onClick={handleNewJournalEntryClick}>
          New Journal
        </TextButton>
        <TextButton navLink onClick={handleNewNodeEntryClick}>
          New Node
        </TextButton>
        {!guestMode && (
          <>
            <NavLink exact to="/profile" activeClassName="nav__active" className={`nav__link${mode}`}>
              Profile / Stats
            </NavLink>
            <NavLink exact to="/entries" activeClassName="nav__active" className={`nav__link${mode}`}>
              Entries
            </NavLink>
          </>
        )}
        <NavLink exact to="/resources" activeClassName="nav__active" className={`nav__link${mode}`}>
          Resources
        </NavLink>
        {!guestMode && (
          <NavLink exact to="/modes" activeClassName="nav__active" className={`nav__link${mode}`}>
            Modes
          </NavLink>
        )}
        <NavLink exact to="/about" activeClassName="nav__active" className={`nav__link${mode}`}>
          About
        </NavLink>
        {isAuthenticated ? (
          <button className={`nav__logout-button${mode}`} onClick={() => dispatch(logout())}>
            Logout
          </button>
        ) : (
          <NavLink exact to="/login" activeClassName="nav__active" className={`nav__link${mode}`}>
            Login
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default NavBarSide
