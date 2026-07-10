import React, { useCallback, useEffect } from 'react'
import { NavLink, useHistory, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import classNames from 'classnames'

// Styles
import '../../styles/rubberDucky.scss'
import styles from './LeftMainNavigation.module.scss'
import arrow from '../../assets/Icons/down-arrow-black-2.png'

// Components
import TextButton from '@components/Shared/TextButton/TextButton'
import DefaultButton from '@components/Shared/DefaultButton/DefaultButton'

// Redux
import { resetCurrentEntryState, createNodeEntry, createJournalEntry } from '@redux/reducers/currentEntryReducer'
import { logout } from '@redux/actions/authActions'
import { toggleLeftSidebar, openLeftSidebar, closeLeftSidebar } from '@redux/reducers/leftSidebarReducer'
import { showToast } from '@utils/toast'
import { normalizeEntryId } from '@utils/normalizeEntryId'
import { ENTRY_TYPES } from '@constants/entryTypes'
import useIsMobile from '@hooks/useIsMobile'

const { NODE } = ENTRY_TYPES

const LeftMainNavigation = () => {
  const dispatch = useDispatch()
  const { leftSidebarOpen } = useSelector((state) => state.leftSidebar)
  const mode = useSelector((state) => state.modes.mode)
  const guestMode = useSelector((state) => state.auth.guestMode)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const user = useSelector((state) => state.auth.user)
  const { entryId, type } = useSelector((state) => state.currentEntry)
  const history = useHistory()
  const location = useLocation()
  const isMobile = useIsMobile()

  const hasCurrentNode = entryId != null && type === NODE
  const isOnEditNodePage = location.pathname.startsWith('/edit-node-entry')

  const handleReturnToEditNode = useCallback(() => {
    if (entryId == null) {
      return
    }

    history.push(`/edit-node-entry?entryId=${entryId}`)
  }, [entryId, history])

  const handleToggleSidebar = useCallback(() => {
    if (isMobile) {
      if (leftSidebarOpen) {
        dispatch(closeLeftSidebar())
      } else {
        dispatch(openLeftSidebar())
      }
      return
    }

    dispatch(toggleLeftSidebar())
  }, [dispatch, isMobile, leftSidebarOpen])

  const handleNewNodeEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const result = await dispatch(createNodeEntry())

    if (createNodeEntry.rejected.match(result)) {
      showToast('Please log in to create a node', 'error')
      return
    }

    const newEntryId = normalizeEntryId(result.payload)
    if (newEntryId == null) {
      showToast('Failed to create node', 'error')
      return
    }

    dispatch(closeLeftSidebar())
    history.push(`/edit-node-entry?entryId=${newEntryId}`)
  }

  const handleNewJournalEntryClick = async () => {
    dispatch(resetCurrentEntryState())
    const result = await dispatch(createJournalEntry())

    if (createJournalEntry.rejected.match(result)) {
      showToast('Please log in to create a journal entry', 'error')
      return
    }

    const newEntryId = normalizeEntryId(result.payload)
    if (newEntryId == null) {
      showToast('Failed to create journal entry', 'error')
      return
    }

    dispatch(closeLeftSidebar())
    history.push(`/create-journal-entry?entryId=${newEntryId}`)
  }

  useEffect(() => {
    if (leftSidebarOpen) {
      const timer = setTimeout(() => {
        dispatch(closeLeftSidebar())
      }, 30000)

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
      {!isMobile && hasCurrentNode && !isOnEditNodePage && (
        <DefaultButton
          className={styles.returnToEditButton}
          tooltip="Back to edit node"
          onClick={handleReturnToEditNode}
        >
          Edit Node
        </DefaultButton>
      )}
      {isMobile && leftSidebarOpen && (
        <div
          className={styles.sheetOverlay}
          onClick={() => dispatch(closeLeftSidebar())}
          aria-hidden="true"
        />
      )}
      <div
        className={classNames(styles.sidebarContainer, {
          [styles.sidebarOpen]: leftSidebarOpen,
        })}
      >
        {isMobile && <div className={styles.dragHandle} />}
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
          className={styles.navTextButton}
          onClick={() => history.push('/public-dashboard?userId=ethorf')}
        >
          {user ? 'Public View' : 'Browse'}
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
            <TextButton navLink className={styles.navTextButton} onClick={handleNewJournalEntryClick}>
              New Journal
            </TextButton>
            <TextButton navLink className={styles.navTextButton} onClick={handleNewNodeEntryClick}>
              New Node
            </TextButton>
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
        {user && (
          <NavLink
            exact
            to="/profile"
            activeClassName={styles.active}
            className={mode === '-.light' ? styles.linkLight : styles.link}
          >
            Profile
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
