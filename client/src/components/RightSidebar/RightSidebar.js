import React, { useEffect, useCallback, useState } from 'react'
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
  const [sortBy, setSortBy] = useState('recent')

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
          data-tooltip-id="main-tooltip"
          data-tooltip-content="open (cmd + shft + K)"
        />
      </button>
      <div
        className={classNames(styles.sidebarContainer, {
          [styles.sidebarOpen]: sidebarOpen,
        })}
      >
        <SidebarNodeSelector sidebarOpen={sidebarOpen} />
        <div className={styles.sortContainer}>
          <label>
            Sort:
            <select className={styles.sortControls} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="default">Default</option>
              <option value="recent">Recent</option>
            </select>
          </label>
        </div>
        <SidebarNodesList sortBy={sortBy} />
      </div>
    </div>
  )
}

export default RightSidebar
