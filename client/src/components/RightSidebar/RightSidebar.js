import React, { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'

// Components
import { SidebarNodesList } from '@components/SidebarNodesList/SidebarNodesList'
import SidebarNodeSelector from '@components/SidebarNodeSelector/SidebarNodeSelector.js'

// Redux
import { toggleSidebar } from '@redux/reducers/sidebarReducer'

// Styles
import arrow from '../../assets/Icons/down-arrow-black-2.png'
import styles from './RightSidebar.module.scss'

const RightSidebar = () => {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector((state) => state.sidebar)

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebar())
  }, [dispatch])

  useEffect(() => {
    const handleToggleSidebarShortcut = (event) => {
      if (event.metaKey && event.shiftKey && event.key === 'k') {
        handleToggleSidebar()
      }
    }

    window.addEventListener('keydown', handleToggleSidebarShortcut)

    return () => {
      window.removeEventListener('keydown', handleToggleSidebarShortcut)
    }
  }, [handleToggleSidebar])

  return (
    <div
      className={classNames(styles.wrapper, {
        [styles.sidebarOpen]: sidebarOpen,
      })}
    >
      <button className={styles.arrowContainer} onClick={handleToggleSidebar}>
        <img
          className={classNames(styles.arrow, { [styles.arrowRotate]: sidebarOpen })}
          src={arrow}
          alt="hamburger arrow"
        />
      </button>
      <div
        className={classNames(styles.sidebarContainer, {
          [styles.sidebarOpen]: sidebarOpen,
        })}
      >
        <SidebarNodeSelector sidebarOpen={sidebarOpen} />
        <SidebarNodesList />
      </div>
    </div>
  )
}

export default RightSidebar
