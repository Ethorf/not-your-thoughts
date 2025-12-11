import React, { useCallback, useEffect } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'

// Styles
import '../../styles/rubberDucky.scss'
import styles from './LeftMainNavigation.module.scss'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'

// Redux
import { resetCurrentEntryState, createNodeEntry, createJournalEntry } from '@redux/reducers/currentEntryReducer'
import { logout } from '@redux/actions/authActions'
import { toggleLeftSidebar } from '@redux/reducers/leftSidebarReducer'

const LeftMainNavigation = () => {
  const dispatch = useDispatch()
  const { leftSidebarOpen } = useSelector((state) => state.leftSidebar)
  const mode = useSelector((state) => state.modes.mode)
  const guestMode = useSelector((state) => state.auth.guestMode)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const user = useSelector((state) => state.auth.user)
  const history = useHistory()

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleLeftSidebar())
  }, [dispatch])

  const handleNewNodeEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newNode = await dispatch(createNodeEntry())

    dispatch(toggleLeftSidebar())
    history.push(`/edit-node-entry?entryId=${newNode.payload}`)
  }

  const handleNewJournalEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const newJournal = await dispatch(createJournalEntry())

    dispatch(toggleLeftSidebar())
    return history.push(`/create-journal-entry?entryId=${newJournal.payload}`)
  }

  useEffect(() => {
    if (leftSidebarOpen) {
      const timer = setTimeout(() => {
        dispatch(toggleLeftSidebar())
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [leftSidebarOpen, dispatch])

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.sidebarOpen]: leftSidebarOpen,
      })}
    >
      <button className={styles.arrowContainer} onClick={handleToggleSidebar}>
        <img
          className={classNames(styles.arrow, { [styles.arrowRotate]: leftSidebarOpen })}
          src={arrow}
          alt="hamburger"
        />
      </button>
      <div
        className={classNames(styles.sidebarContainer, {
          [styles.sidebarOpen]: leftSidebarOpen,
        })}
      >
        <NavLink
          exact
          to="/"
          activeClassName={styles.active}
          className={mode === '-.light' ? styles.linkLight : styles.link}
        >
          Home
        </NavLink>
        {!guestMode && user ? (
          <NavLink
            exact
            to="/dashboard"
            activeClassName={styles.active}
            className={mode === '-.light' ? styles.linkLight : styles.link}
          >
            Dashboard
          </NavLink>
        ) : null}
        <TextButton
          navLink
          onClick={() => history.push('/public-dashboard?userId=4fd36f0e-9159-4561-af4e-e5841994c873')}
        >
          {user ? 'Public View' : 'Browse Networks'}
        </TextButton>
        {!guestMode && user && (
          <>
            <NavLink
              exact
              to="/explore"
              activeClassName={styles.active}
              className={mode === '-.light' ? styles.linkLight : styles.link}
            >
              Explore
            </NavLink>
            <TextButton navLink onClick={handleNewJournalEntryClick}>
              New Journal
            </TextButton>
            <TextButton navLink onClick={handleNewNodeEntryClick}>
              New Node
            </TextButton>
            <NavLink
              exact
              to="/entries"
              activeClassName={styles.active}
              className={mode === '-.light' ? styles.linkLight : styles.link}
            >
              Entries
            </NavLink>
          </>
        )}
        <NavLink
          exact
          to="/resources"
          activeClassName={styles.active}
          className={mode === '-.light' ? styles.linkLight : styles.link}
        >
          Resources
        </NavLink>
        {!guestMode && user && (
          <NavLink
            exact
            to="/modes"
            activeClassName={styles.active}
            className={mode === '-.light' ? styles.linkLight : styles.link}
          >
            Modes
          </NavLink>
        )}
        <NavLink
          exact
          to="/about"
          activeClassName={styles.active}
          className={mode === '-.light' ? styles.linkLight : styles.link}
        >
          About
        </NavLink>
        {isAuthenticated ? (
          <button
            type="button"
            className={mode === '-.light' ? styles.logoutButtonLight : styles.logoutButton}
            onClick={() => {
              dispatch(logout())
              history.push('/')
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink
            exact
            to="/login"
            activeClassName={styles.active}
            className={mode === '-.light' ? styles.linkLight : styles.link}
          >
            Login
          </NavLink>
        )}
      </div>
    </div>
  )
}

export default LeftMainNavigation
