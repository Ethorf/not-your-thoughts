import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { getCookieValue, setCookie } from '@utils/cookieUtils'
import { MODAL_NAMES } from '@constants/modalNames'
import { openModal } from '@redux/reducers/modalsReducer'

import styles from './PublicLegend.module.scss'

const COOKIE_NAME = 'public_legend_seen'
const COOKIE_EXPIRY_DAYS = 365

/**
 * PublicLegend - Help button that opens the legend modal
 * The modal itself is rendered by PublicModalsContainer
 */
const PublicLegend = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // Auto-show legend on first visit
    const hasSeenLegend = getCookieValue(COOKIE_NAME)
    if (!hasSeenLegend) {
      dispatch(openModal(MODAL_NAMES.PUBLIC_LEGEND))
      setCookie(COOKIE_NAME, 'true', COOKIE_EXPIRY_DAYS)
    }
  }, [dispatch])

  const handleOpen = () => {
    dispatch(openModal(MODAL_NAMES.PUBLIC_LEGEND))
  }

  return (
    <button
      className={styles.helpButton}
      onClick={handleOpen}
      aria-label="Show help"
      data-tooltip-id="main-tooltip"
      data-tooltip-content="What?"
    >
      <span className={styles.questionMark}>?</span>
    </button>
  )
}

export default PublicLegend
