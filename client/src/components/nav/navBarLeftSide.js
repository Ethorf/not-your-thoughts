import React, { useCallback } from 'react'
import { NavLink, useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'

// Styles
import '../../styles/rubberDucky.scss'
import styles from './NavBarLeftSide.module.scss'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'

// Redux
import { resetCurrentEntryState, createNodeEntry, createJournalEntry } from '@redux/reducers/currentEntryReducer'
import { logout } from '@redux/actions/authActions'
import { toggleLeftSidebar } from '@redux/reducers/leftSidebarReducer'

const NavBarLeftSide = () => {
  const dispatch = useDispatch()
  const { leftSidebarOpen } = useSelector((state) => state.leftSidebar)
  const mode = useSelector((state) => state.modes.mode)
  const guestMode = useSelector((state) => state.auth.guestMode)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

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
          to="/dashboard"
          activeClassName={styles.active}
          className={mode === '-.light' ? styles.linkLight : styles.link}
        >
          Dashboard
        </NavLink>
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
        {!guestMode && (
          <>
            <NavLink
              exact
              to="/profile"
              activeClassName={styles.active}
              className={mode === '-.light' ? styles.linkLight : styles.link}
            >
              Profile / Stats
            </NavLink>
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
        {!guestMode && (
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
            className={mode === '-.light' ? styles.logoutButtonLight : styles.logoutButton}
            onClick={() => dispatch(logout())}
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

export default NavBarLeftSide
